
import type { QueryResolvers } from '@resolvers';
import type { NodeType } from 'utils/ids';

import { countries } from 'countries';
import { deconstructId } from 'utils/ids';
import { SearchableKind } from 'utils/resolvers';

function nodeTypeFromSearchable(kinds: SearchableKind): NodeType {
    switch (kinds) {
    case SearchableKind.Cluster:
        return 'Cluster';
    case SearchableKind.Country:
        return 'Country';
    }
}

const Query: QueryResolvers = {
    async clusters(_, __, { vpn }) {
        const clusters = await vpn.clusters();
        return clusters.map(cluster => ({ __typename: 'Cluster', cluster }));
    },
    async countries(_, __, { vpn }) {
        const clusters = await vpn.clusters();
        return countries(clusters).map(cluster => ({ __typename: 'Country', cluster }));
    },
    async current(_, __, { vpn }) {
        const cluster = await vpn.connected();
        if (cluster == null) {
            return null;
        }
        return {
            __typename: 'Cluster',
            cluster,
        };
    },
    async node(_, { id }, { vpn }) {
        const deconstructed = deconstructId(id);
        if (deconstructed == null) {
            return null;
        }
        const [nodeType, concreteId] = deconstructed;
        const clusters = await vpn.clusters();

        switch (nodeType) {
        case 'Cluster': {
            const cluster = clusters.find(cluster => cluster.id === concreteId);
            if (cluster == null) {
                return null;
            }
            return {
                __typename: 'Cluster',
                cluster,
            };
        }
        case 'Country': {
            const cluster = clusters.find(cluster => cluster.countryCode === concreteId);
            if (cluster == null) {
                return null;
            }
            return {
                __typename: 'Country',
                cluster,
            };
        }
        }
    },
    async search(_, { query, kinds }, { vpn }) {
        const nodeTypes = kinds.map(nodeTypeFromSearchable);
        return await vpn.search(query, nodeTypes);
    },
};

export default Query;
