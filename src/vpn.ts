import type { Cluster } from 'model';

export interface VPN {
    clusters(): Promise<Cluster[]>,

    connected(): Promise<Cluster | null>,
    connect(cluster: Cluster): Promise<void>,

    disconnect(): Promise<void>,
    dispose(): Promise<void>,
}
