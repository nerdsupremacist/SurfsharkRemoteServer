
import type { MutationResolvers } from '@resolvers';
import type { Cluster } from 'model';

import { deconstructId } from 'utils/ids';

const Mutation: MutationResolvers = {
    async connect(_, { id }, { vpn }) {
        const deconstructed = deconstructId(id);
        if (deconstructed == null) {
            throw `Invalid ID ${id}`;
        }
        const [nodeType, concreteId] = deconstructed;
        const clusters = await vpn.clusters();
        
        let cluster: Cluster;
        switch (nodeType) {
        case 'Cluster': {
            const found = clusters.find(cluster => cluster.id === concreteId);
            if (found == null) {
                throw `No Cluster found with ID ${id}`;
            }
            cluster = found;
            break;
        }
        case 'Country': {
            const found = clusters.
                filter(cluster => cluster.countryCode === concreteId).
                sort((a, b) => a.load - b.load);

            if (found.length < 1) {
                throw `No Country found with ID ${id}`;
            }
            cluster = found[0];
            break;
        }
        }
        await vpn.disconnect();
        await vpn.connect(cluster);
        return {
            __typename: 'Cluster',
            cluster,
        };
    },
    async disconnect(_, __, { vpn }) {
        const cluster = await vpn.connected();
        await vpn.disconnect();
        if (cluster == null) {
            return null;
        }
        return {
            __typename: 'Cluster',
            cluster,
        };
    },
};

export default Mutation;
