const { gql } = require('apollo-server-express');
const PostService = require('../src/service/PostService');


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
        post: Post             
    }
    type Post {
        id: ID!
        url: String
        key: String
        likes: Likes
        comments: [Comments]
        caption: String
        createdDate: String  
    }
    type Comments {
        id: ID!
        commentStatement: String
        commentBy: Employee
    }
    input PostInput {        
        id: ID!
        url: String
        key: String
        likes: LikeInput
        comment: CommentInput
        caption: String
        hashtag: String
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
    type HashTagResponse {
        id: ID!
        posts: [PostResponse]
    }
    type Query {
        getPost(id: ID!): PostResponse
        getAllPosts: [PostResponse]
        getHashTag(hashtag: ID!): HashTagResponse
    }
    type Mutation {
        uploadPhoto(file: Upload, caption: String, hashtag: String): PostResponse
        removePhoto(photoId:ID!, filename: String): Response
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
        getPost: async (_parent, args) => {
            const postService = new PostService();
            const response = await postService.getPost(args);
            return response;
        },
        getAllPosts: async () => {
            const postService = new PostService();
            const response = await postService.getAllPosts();
            return response;
        },
        getHashTag: async (_parent, args) => {
            const { hashtag } = args;
            const postService = new PostService();
            const response = await postService.getHashTag({ id: hashtag });
            return response;
        },
    },
    Mutation: {
        uploadPhoto: async (_parent, args) => {
            const { filename, createReadStream } = await args.file;
            const { caption, hashtag } = args;
            const readStream = createReadStream();
            const postService = new PostService();
            const response = await postService.uploadPhoto(filename, readStream, caption, hashtag);
            return response;
        },
        removePhoto: async (_parent, args) => {
            const { photoId, filename } = args;
            const postService = new PostService();
            const response = await postService.removePhoto(photoId, filename);
            return response;
        },
        likeUnlikePost: async (_parent, args) => {
            const { post } = JSON.parse(JSON.stringify(args));
            const postService = new PostService();
            const response = await postService.likeUnlikePost(post);
            return response;
        },
        upsertComment: async (_parent, args) => {
            const { post } = JSON.parse(JSON.stringify(args));
            const postService = new PostService();
            const response = await postService.upsertComment(post);
            return response;
        },
        removeComment: async (_parent, args) => {
            const { post } = JSON.parse(JSON.stringify(args));
            const postService = new PostService();
            const response = await postService.removeComment(post);
            return response;
        }
    }
};

exports.typeDefs = typeDefs;
exports.resolvers = resolvers;
