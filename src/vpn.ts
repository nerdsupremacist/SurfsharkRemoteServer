import type { Cluster } from 'model';

import dotenv from 'dotenv';
import OpenVPN from 'openvpn';
import Raspi from 'raspi';
import SurfsharkService from 'surfsharkService';

export interface VPN {
    clusters(): Promise<Cluster[]>,
    search(query: string): Promise<Cluster[]>,

    connected(): Promise<Cluster | null>,
    connect(cluster: Cluster): Promise<void>,

    disconnect(): Promise<void>,
    dispose(): Promise<void>,
}

export interface OpenVPNProvider {
    clusters(): Promise<Cluster[]>,
    search(query: string): Promise<Cluster[]>,
    authentication(): Promise<string>,
    configuration(cluster: Cluster): Promise<string>,
    dispose(): Promise<void>,
}

export function vpn(env: NodeJS.ProcessEnv): VPN {
    dotenv.config();
    const username = env.SURFSHARK_USERNAME ?? '';
    const password = env.SURFSHARK_PASSWORD ?? '';
    const raspiInterface = env.RASPI_INTERFACE;

    const provider = new SurfsharkService(username, password);

    if (raspiInterface != null) {
        return new Raspi(provider, raspiInterface);
    }

    return new OpenVPN(provider);
}
