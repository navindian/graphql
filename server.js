const express = require('express');
const expressPlayground = require('graphql-playground-middleware-express').default;
const { ApolloServer } = require('apollo-server-express');
const { apolloUploadExpress } = require('apollo-upload-server');
const fileUpload = require('express-fileupload');
const { typeDefs, resolvers } = require('./graphql/Employee.js');

const PORT = process.env.PORT || 4000;
// Create an express server and a GraphQL endpoint
const app = express();

const server = new ApolloServer({
    typeDefs,
    resolvers,
    path: '/graphql'
});
server.applyMiddleware({ app });
app.get('/playground',    
   apolloUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }),
   expressPlayground({
    endpoint: '/graphql'
})
);
app.listen({port: PORT}, () => {
    console.log('Server listening on port 4000')
});