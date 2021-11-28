
import type { QueryResolvers } from '@resolvers';
import type { Cluster } from 'model';

import { deconstructId } from 'utils/ids';

const Query: QueryResolvers = {
    async clusters(_, __, { vpn }) {
        const clusters = await vpn.clusters();
        return clusters.map(cluster => ({ __typename: 'Cluster', cluster }));
    },
    async countries(_, __, { vpn }) {
        const clusters = await vpn.clusters();
        const countries: string[] = [];
        const onePerCountry: Cluster[] = [];
        clusters.forEach(cluster => {
            if (!countries.includes(cluster.countryCode)) {
                countries.push(cluster.countryCode);
                onePerCountry.push(cluster);
            }
        });
        return clusters.map(cluster => ({ __typename: 'Country', cluster }));
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
        return null;
    },
};

export default Query;
