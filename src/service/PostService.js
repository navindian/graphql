const dynamodbClient = require('../utils/DynamoDBClient');
const PostRepository = require('../repository/PostRepository');
const HashTagRepository = require('../repository/HashtagRepository');
const { v4 } = require('uuid');
const AWS = require('aws-sdk');
// Enter copied or downloaded access ID and secret key here
const ID = 'AKIAILOBKXKXLOUJLXCA';
const SECRET = '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';

// The name of the bucket that you have created
const BUCKET_NAME = 'dhivyaa';
const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET
});
class PostService {
    constructor() {
        this.postRepository = new PostRepository(dynamodbClient);
        this.hashtagRepository = new HashTagRepository(dynamodbClient);
    }
    async getPost(id) {
        try {
            const post = await this.postRepository.get(id);
            console.log("post..",post)
            return {
                code: 200,
                success: true,
                message: "Post fetched successfully",
                post 
            }
        }
        catch (error) {

        }
    }
    async getAllPosts() {
        try {
            const post = await this.postRepository.scan();
            return {
                code: 200,
                success: true,
                message: "Post fetched successfully",
                posts: post.Items 
            }
        }
        catch (error) {

        }
    }
    async getHashTag(hashtag) {
        try {
            const hashtagResponse = await this.hashtagRepository.get(hashtag);
            return {
                code: 200,
                success: true,
                message: "Post fetched successfully",
                posts: hashtagResponse
            }
        }
        catch (error) {

        }
    }
    async uploadPhoto(filename, readStream, caption, hashtag) {
        try {
            let post;
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
                    caption: caption,
                    createdDate: new Date().toISOString()
                }
                await this.postRepository.put(post);
                if (hashtag) {
                    let hashtagResponse = await this.hashtagRepository.get({ id: hashtag });
                    if (hashtagResponse) {
                        hashtagResponse.posts = hashtagResponse.posts ? hashtagResponse.posts : [];
                        hashtagResponse.posts.push(post);
                    }
                    else {
                        hashtagResponse = {
                            id: hashtag,
                            posts: []
                        };
                        hashtagResponse.posts.push(post);
                    }
                    await this.hashtagRepository.put(hashtagResponse);
                }
            }
            return {
                code: 200,
                success: true,
                message: 'Post uploaded successfully',
                post
            }
        }
        catch (error) {
            console.log("error", error)
            return {
                code: 500,
                success: false,
                message: 'Post upload failed',
            }
        }
    }
    async removePhoto(photoId, filename) {
        try {
            await s3.deleteObject({
                Bucket: BUCKET_NAME,
                Key: filename
            }).promise();
            const deleteResponse = await this.postRepository.delete({ id: photoId });
            if (deleteResponse) {
                return {
                    code: 200,
                    success: true,
                    message: 'Post deleted successfully'
                };
            }
        }
        catch (error) {

        }
    }
    async likeUnlikePost(post) {
        console.log("LIKE..", post)
        let filteredResponse, putResponse;
        try {
            let getResponse = await this.postRepository.get({ id: post.id });
            console.log("getResponse1", getResponse)
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
                    console.log("getResponse2", getResponse)
                }
                else {

                    getResponse.likes.count = getResponse.likes.count + 1;
                    getResponse.likes.employee.push(post.likes.employee);
                    console.log("getResponse", getResponse.likes.employee)
                }
            }
            putResponse = await this.postRepository.put(getResponse);
            if (putResponse) {
                return {
                    code: 200,
                    success: true,
                    message: 'Post updated successfully',
                    post: getResponse
                };
            }
        }
        catch (error) {

        }
    }
    async upsertComment(post) {
        try {
            let getResponse = await this.postRepository.get({ id: post.id });
            console.log("getResponse..",getResponse)
            let filteredResponse = getResponse.comments.find((comment) => {
                if (comment.id === post.comment.id) {
                    comment.commentStatement = post.comment.commentStatement;
                    comment.createdDate = new Date().toISOString();
                    return comment;
                }
            });
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
            let putResponse = await this.postRepository.put(getResponse);
            console.log("getResponse..",getResponse)
            if (putResponse) {
                return {
                    code: 200,
                    success: true,
                    message: 'comment added successfully',
                    post: getResponse
                };
            }
        }
        catch (error) {

        }
    }
    async removeComment(post) {
        try {
            let filteredResponse;
            let getResponse = await this.postRepository.get({ id: post.id });
            if (post && post.comment) {
                filteredResponse = getResponse.comments.filter((comment) => comment.id !== post.comment.id);
            }
            getResponse.comments = filteredResponse;
            let putResponse = await this.postRepository.put(getResponse);
            if (putResponse) {
                return {
                    code: 200,
                    success: true,
                    message: 'comment added successfully',
                    post: getResponse
                };
            }
        }
        catch (error) {

        }
    }
}

module.exports = PostService;