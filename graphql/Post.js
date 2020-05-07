const { gql } = require('apollo-server-express');

// GraphQL schema
const typeDefs = gql(`
    type Response {
        code: Int
        success: Boolean
        message: String
    }
    type PostResponse {
        code: Int!
        success: Boolean
        message: String
        post: [Post]
    }
    type Post {
        id: ID!
        url: String
        key: String
        likes: Likes
        comments: [Comments]
        caption: String
        createdDate: String
        createdBy: Employee
    }
    type Comments {
        id: ID!
        commentStatement: String
        commentBy: Employee
    }
    input uploadPostInput {
        file: Upload
        caption: String
        createdBy: EmployeeInput
    }
    input PostInput {        
        id: ID!
        url: String
        key: String
        likes: LikeInput
        comment: CommentInput
        caption: String
        createdBy: EmployeeInput
    }
    input CommentInput {
        id: ID
        commentStatement: String
        commentBy: EmployeeInput
    }
    input LikeInput {
        employee: EmployeeInput
    }
    type Likes {
        count: Int!
        employee: [Employee]
    }
    type Employee {
        id: ID!
        firstName: String
        lastName: String
    }
    type Query {
        getPost(id: ID!): PostResponse
        getAllPosts: PostResponse
    }
    type Mutation {
        uploadPost(post: uploadPostInput): PostResponse
        removePost(photoId:ID!, filename: String): Response
        likeUnlikePost(post: PostInput): PostResponse
        upsertComment(post: PostInput): PostResponse
        removeComment(post: PostInput): PostResponse
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
        getPost: async (_, args, {dataSources}) => {
            const response = await dataSources.postService.getPost(args);
            return response;
        },
        getAllPosts: async (_, __, {dataSources}) => {
            const response = await dataSources.postService.getAllPosts();
            return response;
        },
    },
    Mutation: {
        uploadPost: async (_, args, {dataSources}) => {
            const { post } = args;            
            const response = await dataSources.postService.uploadPost(post);
            return response;
        },
        removePost: async (_, args, {dataSources}) => {
            const { photoId, filename } = args;
            const response = await dataSources.postService.removePost(photoId, filename);
            return response;
        },
        likeUnlikePost: async (_, args, {dataSources}) => {
            const { post } = JSON.parse(JSON.stringify(args));
            const response = await dataSources.postService.likeUnlikePost(post);
            return response;
        },
        upsertComment: async (_, args, {dataSources}) => {
            const { post } = JSON.parse(JSON.stringify(args));
            const response = await dataSources.postService.upsertComment(post);
            return response;
        },
        removeComment: async (_, args, {dataSources}) => {
            const { post } = JSON.parse(JSON.stringify(args));
            const response = await dataSources.postService.removeComment(post);
            return response;
        }
    }
};

exports.typeDefs = typeDefs;
exports.resolvers = resolvers;
