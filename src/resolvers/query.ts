
import type { QueryResolvers } from '@resolvers';

const Query: QueryResolvers = {
    greeting() {
        return 'Hello World';
    },
};

export default Query;
