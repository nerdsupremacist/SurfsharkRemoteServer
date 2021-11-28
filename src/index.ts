
import type { Context } from 'context';

import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import resolvers from 'resolvers';
import { typeDefs } from 'typeDefs';

dotenv.config();

const app = express();
const PORT = process.env.PORT != null ? parseInt(process.env.PORT, 10) : 8000;

app.set('trust proxy', true);
app.use(
    cors(),
);

const context: Context = {};

const apollo = new ApolloServer(
    {
        context: () => {
            context;
        },
        introspection: true,
        playground: { subscriptionEndpoint: '/subscriptions' },
        resolvers,
        typeDefs,
        uploads: false,
    },
);

apollo.applyMiddleware({
    app,
    path: '/graphql',
});

app.listen(
    PORT,
    () => {
        console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
    },
);
