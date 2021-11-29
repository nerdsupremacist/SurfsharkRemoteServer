
import type { Context } from 'context';

import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import resolvers from 'resolvers';
import { typeDefs } from 'typeDefs';
import { vpn as vpnFactory } from 'vpn';

dotenv.config();

const app = express();
const PORT = process.env.PORT != null ? parseInt(process.env.PORT, 10) : 8000;

const vpn = vpnFactory(process.env);
const context: Context = { vpn };

app.set('trust proxy', true);
app.use(cors());

const apollo = new ApolloServer(
    {
        context,
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

// handleExit(async () => {
//     await vpn.disconnect();
// });
