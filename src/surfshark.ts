import type { AxiosInstance } from 'axios';
import type { Cluster } from 'model';
import type { VPN } from 'vpn';

import axios from 'axios';
import fs from 'fs';
import StreamZip from 'node-stream-zip';
import { OpenVPN } from 'openvpn-cli-wrapper';
import os from 'os';
import path from 'path';
import * as stream from 'stream';

type Connection = {
    cluster: Cluster,
    vpn: OpenVPN,
}

class Surfshark implements VPN {
    #username: string;
    #password: string;

    #connection: Connection | null;
    #clusters: Cluster[];

    #axios: AxiosInstance;
    #dataDirectory: string;

    constructor(username: string, password: string) {
        this.#username = username;
        this.#password = password;
        this.#connection = null;
        this.#clusters = [];
        this.#axios = axios.create(
            {
                baseURL: 'https://my.surfshark.com/vpn/api/v1/server/',
            },
        );

        this.#dataDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'surfshark-vpn-remote'));

        console.log(this.#dataDirectory);

        this.#downloadConfigs();
    }

    async connect(cluster: Cluster) {
        let configFileName: string;
        if (cluster.unrestricted != null && cluster.unrestricted.length > 0) {
            const ip = cluster.unrestricted[0].entryIp.value;
            configFileName = `${ip}_udp.ovpn`;
        } else {
            configFileName = `${cluster.connectionName}_udp.ovpn`;
        }

        const configFile = path.join(this.#dataDirectory, configFileName);
        const authFile = await this.#writeAuth();

        const vpn = new OpenVPN(
            [
                '--auth-nocache',
                '--config',
                configFile,
                '--auth-user-pass',
                authFile,
            ],
        );

        vpn.connect();
        this.#connection = { cluster, vpn };
    }
    
    async connected() {
        return this.#connection?.cluster ?? null;
    }

    async clusters() {
        if (this.#clusters.length > 0) {
            return this.#clusters;
        }
        return await this.#updateClusters();
    }

    async disconnect() {
        if (this.#connection != null) {
            this.#connection.vpn.disconnect();
            this.#connection = null;
        }
    }

    async dispose() {
        await this.disconnect();
        await this.#cleanUp();
    }

    async #updateClusters() {
        const response = await this.#axios.get<Cluster[]>('clusters');
        const clusters = response.data;
        this.#clusters = clusters;
        return clusters;
    }

    async #downloadConfigs() {
        const file = path.join(this.#dataDirectory, 'configs.zip');
        const writer = fs.createWriteStream(file);
        const response = await this.#axios.get('configurations', { responseType: 'stream' });
        response.data.pipe(writer);
        await new Promise<void>((resolve, reject) => {
            stream.finished(writer, err => {
                if (err != null) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        const zip = new StreamZip.async({ file: file });
        await zip.extract(null, this.#dataDirectory);
        await zip.close();
        await new Promise<void>((resolve, reject) => {
            fs.unlink(file, err => {
                if (err != null) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    #cleanUp() {
        return new Promise<void>((resolve, reject) => {
            fs.rmdir(this.#dataDirectory, { recursive: true }, err => {
                if (err != null) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    async #writeAuth() {
        return await new Promise<string>((resolve, reject) => {
            const file = path.join(this.#dataDirectory, '.auth');
            fs.writeFile(
                file,
                `${this.#username}\n${this.#password}\n`,
                err => {
                    if (err != null) {
                        reject(err);
                    } else {
                        resolve(file);
                    }
                },
            );
        });
    }
}

export default Surfshark;
