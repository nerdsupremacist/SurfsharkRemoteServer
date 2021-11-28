
import type { ClusterResolvers } from '@resolvers';

import { buildId } from 'utils/ids';

const Cluster: ClusterResolvers = {
    id({ cluster }) {
        return buildId('Cluster', cluster.id);
    },
    load({ cluster }) {
        return cluster.load;
    },
    location({ cluster }) {
        return cluster;
    },
};

export default Cluster;
