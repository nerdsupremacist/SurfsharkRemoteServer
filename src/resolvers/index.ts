
import type { Resolvers } from '@resolvers';

import Cluster from './cluster';
import Country from './country';
import Location from './location';
import Mutation from './mutation';
import Node from './node';
import Query from './query';

import { GraphQLURL as URL } from 'graphql-scalars';

const resolvers: Resolvers = {
    Cluster,
    Country,
    Location,
    Mutation,
    Node,
    Query,
    URL,
};

export default resolvers;
