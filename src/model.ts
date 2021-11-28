
import type { NodeType } from 'utils/ids';

export interface Coordinates {
    longitude: number,
    latitude: number,
}

export interface EntryIp {
    value: string,
}

export interface Unrestricted {
    id: string,
    entryIp: EntryIp,
}

export interface Cluster {
    country: string,
    countryCode: string,
    region: string,
    regionCode: string,
    load: number,
    id: string,
    coordinates: Coordinates,
    tags: string[],
    type: string,
    location: string,
    connectionName: string,
    flagUrl: string,
    unrestricted: Unrestricted[],
}

export type NodeClusterTypeWrapper = {
    __typename: NodeType,
    cluster: Cluster,
}
