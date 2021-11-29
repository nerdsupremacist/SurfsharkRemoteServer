
import type { MutationResolvers } from '@resolvers';

import { deconstructId } from 'utils/ids';

const Mutation: MutationResolvers = {
    async connect(_, { id }, { vpn }) {
        const deconstructed = deconstructId(id);
        if (deconstructed == null) {
            throw `Invalid ID ${id}`;
        }
        const [nodeType, concreteId] = deconstructed;
        if (nodeType !== 'Cluster') {
            throw `ID ${id} does not belong to a cluster`;
        }
        const clusters = await vpn.clusters();
        const cluster = clusters.find(cluster => cluster.id === concreteId);
        if (cluster == null) {
            throw `No Cluster found with ID ${id}`;
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
