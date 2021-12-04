import { gql } from 'apollo-server-express';

export const typeDefs = gql`
    # An object with a Globally Unique ID
    interface Node {
        # The ID of the object.
        id: ID!
    }

    scalar URL

    type Country implements Node {
        id: ID!
        name: String!
        code: String!
        flagURL: URL!

        clusters: [Cluster!]!
    } 

    type Location {
        name: String!
        country: Country!
    }
    
    type Cluster implements Node {
        id: ID!
        load: Float!
        location: Location!
    }

    enum SearchableKind {
        CLUSTER
        COUNTRY
    }

    type Query {
        node(id: ID!): Node
        current: Cluster
        countries: [Country!]!
        clusters: [Cluster!]!
        search(query: String!, kinds: [SearchableKind!]! = [CLUSTER, COUNTRY]): [Node!]!
    }

    type Mutation {
        connect(id: ID!): Cluster!
        disconnect: Cluster
    }
`;
