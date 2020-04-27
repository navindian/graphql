const { buildSchema } = require('graphql');
const { gql } = require('apollo-server-express');
const EmployeeService = require('../src/service/EmployeeService');


// GraphQL schema
const typeDefs = gql(`
    type Response {
        code: Int
        success: Boolean
        message: String
    }
    type PostResponse {
        id: ID!
        url: String
        key: String
        likes: Likes
    }
    input Post {
        id: ID!
        url: String
        key: String
        likes: LikeInput
        comments: [CommentInput]
    }
    input CommentInput {
        comment: String
        commentBy: String
    }
    input LikeInput {
        count: Int!
        employee: [EmployeeInput]
    }
    type Likes {
        count: Int!
        employee: [Employee]
    }
    type Employee {
        id: ID!
        firstname: String!
        lastname: String!
    }
    type Query {
        getEmployeeById(id:ID!): EmployeeResponse
        getAllEmployeeDetails: [EmployeeResponse]
        getPost(id: ID!): PostResponse
        getAllPosts: [PostResponse]
    }
    type Mutation {
        addEmployee(employee: EmployeeInput): EmployeeResponse
        removeEmployee(id:ID!): RemoveEmployeeResponse
        uploadPhoto(file: Upload): Response
        removePhoto(photoId:ID!, filename: String): Response
        updatePost(post: Post): Response
    }
    type RemoveEmployeeResponse {
        message: String
    }
    type EmployeeResponse {
        id: ID!
        firstName: String
        lastName: String
    }
    input EmployeeInput {
        id: ID!
        firstName: String
        lastName: String
    }
`);
// resolver
const resolvers = {
    Query: {
        getPost: async (_parent, args) => {
            const employeeService = new EmployeeService();
            const employeeDetails = await employeeService.getPost(args);
            return employeeDetails;
        },
        getAllPosts: async () => {
            const employeeService = new EmployeeService();
            const employeeDetails = await employeeService.getAllPosts();
            return employeeDetails;
        }
    },
    Mutation: {
        uploadPhoto: async (_parent, args) => {
            const { filename, createReadStream } = await args.file;
            const readStream = createReadStream();
            const employeeService = new EmployeeService();
            const response = await employeeService.uploadPhoto(filename, readStream);
            return response;
        },
        removePhoto: async (_parent, args) => {
            const { photoId, filename } = args;
            const employeeService = new EmployeeService();
            const response = await employeeService.removePhoto(photoId, filename);
            return response;
        },
        updatePost: async (_parent, args) => {
            const { post } = JSON.parse(JSON.stringify(args));
            const employeeService = new EmployeeService();
            const response = await employeeService.updatePost(post);
            return response;
        }
    }
};

exports.typeDefs = typeDefs;
exports.resolvers = resolvers;
