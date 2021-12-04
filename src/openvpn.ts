
import type { Cluster } from 'model';
import type { OpenVPNProvider, VPN } from 'vpn';

import OpenVPNProcess from 'openvpnProcess';

type Connection = {
    cluster: Cluster,
    vpn: OpenVPNProcess,
}

class OpenVPN implements VPN {
    #provider: OpenVPNProvider;
    #connection: Connection | null;

    constructor(provider: OpenVPNProvider) {
        this.#provider = provider;
        this.#connection = null;
    }

    async connect(cluster: Cluster) {
        const configFile = await this.#provider.configuration(cluster);
        const authFile = await this.#provider.authentication();

        const vpn = new OpenVPNProcess(
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
        return await this.#provider.clusters();
    }

    async search(query: string) {
        return await this.#provider.search(query);
    }

    async disconnect() {
        if (this.#connection != null) {
            this.#connection.vpn.disconnect();
            this.#connection = null;
        }
    }

    async dispose() {
        await this.disconnect();
        await this.#provider.dispose();
    }
}

export default OpenVPN;
