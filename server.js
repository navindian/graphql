const express = require('express');
const expressPlayground = require('graphql-playground-middleware-express').default;
const { ApolloServer } = require('apollo-server-express');
const fileUpload = require('express-fileupload');
const { typeDefs, resolvers } = require('./graphql/Post.js');
const postService = require('./src/service/PostService');
const PORT = process.env.PORT || 4000;
// Create an express server and a GraphQL endpoint
const app = express();

const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => {
        return {
            postService: new postService()
        };
    },
    path: '/graphql'
});
server.applyMiddleware({ app });
app.get('/playground',
    expressPlayground({
        endpoint: '/graphql'
    })
);
app.listen({ port: PORT }, () => {
    console.log('Server listening on port 4000')
});