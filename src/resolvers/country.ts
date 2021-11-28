
import type { CountryResolvers } from '@resolvers';

import { buildId } from 'utils/ids';

const Country: CountryResolvers = {
    async clusters({ cluster }, _, { vpn }) {
        const clusters = await vpn.clusters();
        return clusters.
            filter(other => other.countryCode === cluster.countryCode).
            map(other => ({ __typename: 'Cluster', cluster: other }));
    },
    code({ cluster }) {
        return cluster.countryCode;
    },
    flagURL({ cluster }) {
        return cluster.flagUrl;
    },
    id({ cluster }) {
        return buildId('Country', cluster.countryCode);
    },
    name({ cluster }) {
        return cluster.country;
    },
};

export default Country;
