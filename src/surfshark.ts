import type { AxiosInstance } from 'axios';
import type { Cluster } from 'model';
import type { ScheduledTask } from 'node-cron';
import type { VPN } from 'vpn';

import axios from 'axios';
import fs from 'fs';
import cron from 'node-cron';
import StreamZip from 'node-stream-zip';
import OpenVPN from 'openvpn';
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

    #cronTask: ScheduledTask

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
        this.#downloadConfigs();
        // Update configs and clusters every 30 mins
        this.#cronTask = cron.schedule('*/30 * * * *', () => {
            this.#downloadConfigs();
            this.#updateClusters();
        });
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

        await new Promise<void>((resolve, reject) => {
            let isConnected = false;
            
            const onConnect = () => {
                if (!isConnected) {
                    resolve();
                }
                isConnected = true;
            };

            const onDisconnect = () => {
                this.#connection = null;
                if (!isConnected) {
                    reject('Failed to start connection to vpn');
                }
            };

            vpn.events.on('connected', onConnect.bind(this));
            vpn.events.on('disconnected', onDisconnect.bind(this));
            vpn.connect();
        });

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
        this.#cronTask.destroy();
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
            const auth = `${this.#username}\n${this.#password}\n`;
            fs.writeFile(
                file,
                auth,
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
