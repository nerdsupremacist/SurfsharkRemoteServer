import type { AxiosInstance } from 'axios';
import type { Cluster } from 'model';
import type { ScheduledTask } from 'node-cron';
import type { NodeType } from 'utils/ids';
import type { OpenVPNProvider } from 'vpn';

import axios from 'axios';
import { countries as getCountries } from 'countries';
import fs from 'fs';
import Fuse from 'fuse.js';
import cron from 'node-cron';
import StreamZip from 'node-stream-zip';
import os from 'os';
import path from 'path';
import * as stream from 'stream';

const fuseClusterOptions: Fuse.IFuseOptions<Cluster> = {
    includeScore: true,
    keys: [
        {
            name: 'location',
            weight: 2,
        },
        'country',
    ],
    minMatchCharLength: 3,
    threshold: 0.25,
};

const fuseCountryOptions: Fuse.IFuseOptions<Cluster> = {
    includeScore: true,
    keys: [
        {
            name: 'country',
            weight: 3,
        },
        'countryCode',
    ],
    minMatchCharLength: 2,
    threshold: 0.25,
};

class SurfsharkService implements OpenVPNProvider {
    #username: string;
    #password: string;

    #clusters: Cluster[];
    #fuse: Record<NodeType, Fuse<Cluster>> | null;

    #axios: AxiosInstance;
    #dataDirectory: string;

    #cronTask: ScheduledTask;

    constructor(username: string, password: string) {
        this.#username = username;
        this.#password = password;
        this.#clusters = [];
        this.#fuse = null;
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

    async clusters() {
        if (this.#clusters.length > 0) {
            return this.#clusters;
        }
        const [clusters] = await this.#updateClusters();
        return clusters;
    }

    async search(query: string, nodeTypes: NodeType[]) {
        const fuse = await this.#getFuse();
        return nodeTypes.
            flatMap(type => {
                const results = fuse[type]?.
                    search(query);
                const mapped = results?.
                    map(item => ({ item: { __typename: type, cluster: item.item }, score: item.score ?? 0 })) ?? [];
                return mapped;
            }).
            sort((a, b) => a.score - b.score).
            map(item => item.item);
    }

    async configuration(cluster: Cluster) {
        let configFileName: string;
        if (cluster.unrestricted != null && cluster.unrestricted.length > 0) {
            const ip = cluster.unrestricted[0].entryIp.value;
            configFileName = `${ip}_udp.ovpn`;
        } else {
            configFileName = `${cluster.connectionName}_udp.ovpn`;
        }

        return path.join(this.#dataDirectory, configFileName);
    }

    async authentication() {
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

    async #getFuse() {
        if (this.#fuse != null) {
            return this.#fuse;
        }
        const [, fuse] = await this.#updateClusters();
        return fuse;
    }

    async #updateClusters(): Promise<[Cluster[], Record<NodeType, Fuse<Cluster>>]> {
        const response = await this.#axios.get<Cluster[]>('clusters');
        const clusters = response.data;
        const countries = getCountries(clusters);
        this.#clusters = clusters;
        const fuse: Record<NodeType, Fuse<Cluster>> = {
            'Cluster': new Fuse(clusters, fuseClusterOptions),
            'Country': new Fuse(countries, fuseCountryOptions),
        };
        this.#fuse = fuse;
        return [clusters, fuse];
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

    dispose() {
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
}

export default SurfsharkService;
