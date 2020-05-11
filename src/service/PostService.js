const dynamodbClient = require('../utils/DynamoDBClient');
const PostRepository = require('../repository/PostRepository');
const logger = require('../utils/LogUtils');
const { v4 } = require('uuid');
const AWS = require('aws-sdk');
AWS.profile = 'awss3';
// The name of the S3 bucket
const BUCKET_NAME = process.argv[2];
const credentials = new AWS.SharedIniFileCredentials({profile: 'awss3'});
AWS.config.credentials = credentials;
const s3 = new AWS.S3();

class PostService {
    constructor() {
        this.postRepository = new PostRepository(dynamodbClient);
        this.getPost = this.getPost.bind(this);
        this.getAllPosts = this.getAllPosts.bind(this);
        this.uploadPost = this.uploadPost.bind(this);
        this.removePost = this.removePost.bind(this);
        this.likeUnlikePost = this.likeUnlikePost.bind(this);
        this.upsertComment = this.upsertComment.bind(this);
        this.removeComment = this.removeComment.bind(this);
    }
    async getPost(id) {
        try {
            const postDetails = [];
            const post = await this.postRepository.get(id);
            if (post) {
                postDetails.push(post);
            }
            else {
                return {
                    code: 404,
                    success: false,
                    message: "Post not found",
                    post: postDetails
                }
            }
            return {
                code: 200,
                success: true,
                message: "Post fetched successfully",
                post: postDetails
            }
        }
        catch (error) {
            logger.error('Error while fetching post');
            return {
                code: 500,
                success: false,
                message: "Error while fetching post: " + error,
                post: null
            }
        }
    }
    async getAllPosts() {
        try {
            const post = await this.postRepository.scan();
            return {
                code: 200,
                success: true,
                message: "Post fetched successfully",
                post: post.Items
            }
        }
        catch (error) {
            logger.error('Error while fetching post');
            return {
                code: 500,
                success: false,
                message: "Error while fetching post: " + error,
                post: null
            }
        }
    }
    async uploadPost(post) {
        const { filename, createReadStream } = await post.file;
        const { caption, createdBy } = post;
        try {            
            const readStream = createReadStream();
            let post;
            let postResponse = [];
            // Setting up S3 upload parameters
            const params = {
                Bucket: BUCKET_NAME,
                Key: `uploads/${filename}`,
                Body: readStream
            };

            // Uploading files to the bucket
            const fileUploadResponse = await s3.upload(params).promise();
            if (fileUploadResponse) {
                post = {
                    id: v4(),
                    url: fileUploadResponse.Location,
                    key: fileUploadResponse.Key,
                    caption,
                    likes: {count: 0},
                    comments: [],
                    createdDate: new Date().toISOString(),
                    createdBy
                }
                await this.postRepository.put(post);
            }
            postResponse.push(post);
            return {
                code: 201,
                success: true,
                message: 'Post uploaded successfully',
                post: postResponse
            }
        }
        catch (error) {
            logger.error('Error while uploading post: ' + error)
            return {
                code: 500,
                success: false,
                message: 'Post upload failed',
            }
        }
    }
    async removePost(photoId, filename) {
        try {
            await this.postRepository.delete({ id: photoId });
            const deleteResponse = await s3.deleteObject({
                Bucket: BUCKET_NAME,
                Key: filename
            }).promise();
            if (deleteResponse) {
                return {
                    code: 200,
                    success: true,
                    message: 'Post deleted successfully',
                    post: {}
                };
            }
        }
        catch (error) {
            logger.error('Error while deleting post');
            return {
                code: 500,
                success: false,
                message: 'Post deletion failed',
                post: {}
            };
        }
    }
    async likeUnlikePost(post) {
        let filteredResponse, putResponse;
        try {
            let postResponse = [];
            let getResponse = await this.postRepository.get({ id: post.id });
            if (getResponse && post && post.likes) {
                getResponse.likes = getResponse.likes ? getResponse.likes : {};
                getResponse.likes.count = getResponse.likes.count ? getResponse.likes.count : 0;
                if (!getResponse.likes.employee) {
                    getResponse.likes.employee = [];
                }
                filteredResponse = getResponse.likes.employee.filter((obj) => obj.id === post.likes.employee.id);
                if (filteredResponse && filteredResponse.length > 0) {
                    getResponse.likes.count = getResponse.likes.count - 1;
                    getResponse.likes.employee = getResponse.likes.employee.filter((obj) => obj.id !== post.likes.employee.id);
                }
                else {
                    getResponse.likes.count = getResponse.likes.count + 1;
                    getResponse.likes.employee.push(post.likes.employee);
                }
            }
            postResponse.push(getResponse);
            putResponse = await this.postRepository.update(getResponse, 'likes');
            if (putResponse) {
                return {
                    code: 200,
                    success: true,
                    message: 'Post liked/unliked',
                    post: postResponse
                };
            }
        }
        catch (error) {
            logger.error('Error while saving like' + error);
            return {
                code: 500,
                success: false,
                message: 'Could not save your like. Please try again',
                post: {}
            };
        }
    }
    async upsertComment(post) {
        try {
            let postResponse = [];
            let getResponse = await this.postRepository.get({ id: post.id });
            let filteredResponse = getResponse.comments ? getResponse.comments.find((comment) => {
                if (comment.id === post.comment.id) {
                    comment.commentStatement = post.comment.commentStatement;
                    comment.createdDate = new Date().toISOString();
                    return comment;
                }
            }) : null;
            if (!filteredResponse) {
                const commentId = v4();
                post.comment.id = commentId;
                post.comment.createdDate = new Date().toISOString();
                if (post.comment) {
                    if (getResponse.comments) {
                        getResponse.comments.push(post.comment)
                    }
                    else {
                        getResponse.comments = [];
                        getResponse.comments.push(post.comment);
                    }
                }
            }
            postResponse.push(getResponse);
            let putResponse = await this.postRepository.update(getResponse, 'comments');
            if (putResponse) {
                return {
                    code: 200,
                    success: true,
                    message: 'Comment saved successfully ',
                    post: postResponse
                };
            }
        }
        catch (error) {
            logger.error('Error while saving comment' + error);
            return {
                code: 500,
                success: false,
                message: 'Error while saving comment. Please try again',
                post: {}
            };
        }
    }
    async removeComment(post) {
        try {
            let filteredResponse;
            let postResponse = [];
            let getResponse = await this.postRepository.get({ id: post.id });
            if (post && post.comment) {
                filteredResponse = getResponse.comments.filter((comment) => comment.id !== post.comment.id);
            }
            getResponse.comments = filteredResponse;
            let putResponse = await this.postRepository.update(getResponse, 'comments');
            postResponse.push(getResponse);
            if (putResponse) {
                return {
                    code: 200,
                    success: true,
                    message: 'Comment removed successfully',
                    post: postResponse
                };
            }
        }
        catch (error) {
            logger.error('Error while removing comment ' + error);
            return {
                code: 500,
                success: false,
                message: 'Error while removing comment. Please try again',
                post: {}
            };
        }
    }
}

module.exports = PostService;