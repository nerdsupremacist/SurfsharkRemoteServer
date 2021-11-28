
import type { LocationResolvers } from '@resolvers';

const Location: LocationResolvers = {
    country(cluster) {
        return {
            __typename: 'Country',
            cluster,
        };
    },
    name({ location }) {
        return location;
    },
};

export default Location;
