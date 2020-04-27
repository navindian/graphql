const dynamodbClient = require('../../src/utils/DynamoDBClient');
const EmployeeRepository = require('../repository/EmployeeRepository');
const PostRepository = require('../repository/PostRepository');
const cloudinary = require('cloudinary');
const { v4 } = require('uuid');
const AWS = require('aws-sdk');
// const imageUploader = require('./src/routes/ImageUploader');
// Enter copied or downloaded access ID and secret key here
const ID = 'AKIAJABUBPXGBI3MCPDA';
const SECRET = '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';

// The name of the bucket that you have created
const BUCKET_NAME = 'dhivyaa';
const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET
});
class EmployeeService {
    constructor() {
        this.employeeRepository = new EmployeeRepository(dynamodbClient);
        this.postRepository = new PostRepository(dynamodbClient)
    }
    async getEmployeeById(id) {
        const employee = await this.employeeRepository.get(id);
        return employee;
    }
    async getAllEmployeeDetails() {
        const employees = await this.employeeRepository.scan();
        return employees.Items;
    }
    async addEmployee(employee) {
        await this.employeeRepository.put(employee);
        return employee;
    }
    async removeEmployee(id) {
        await this.employeeRepository.delete(id);
        return { message: 'Employee deleted successfully' };
    }
    async getPost(id) {
        const post = await this.postRepository.get(id);
        return post;
    }
    async getAllPosts() {
        const post = await this.postRepository.scan();
        return post.Items;
    }
    async uploadPhoto(filename, readStream) {
        try {
            // Setting up S3 upload parameters
            const params = {
                Bucket: BUCKET_NAME,
                Key: `uploads/${filename}`,
                Body: readStream
            };

            // Uploading files to the bucket
            const fileUploadResponse = await s3.upload(params).promise();
            const post = {
                id: v4(),
                url: fileUploadResponse.Location,
                key: fileUploadResponse.Key
            }
            console.log("ID..", post.id)
            await this.postRepository.put(post)
            return {
                code: 200,
                success: true,
                message: 'File uploaded successfully',
            }
        }
        catch (error) {
            return {
                code: 500,
                success: false,
                message: 'File upload failed',
            }
        }
    }
    async removePhoto(photoId, filename) {
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
    async updatePost(post) {
        let getResponse = await this.postRepository.get({id: post.id});
        console.log("post..",post)        
        if(getResponse && post && post.likes) {
            getResponse.likes = getResponse.likes ? getResponse.likes : {};
            getResponse.likes.count = getResponse.likes.count ? getResponse.likes.count : 0;
            getResponse.likes.count = getResponse.likes.count + post.likes.count;
            console.log("getResponse..",getResponse.likes.employee)
            if(!getResponse.likes.employee) {
                getResponse.likes.employee = [];
            }
            getResponse.likes.employee.push(post.likes.employee[0]); 
        }
        if(getResponse && post && post.comments) {
            getResponse.comments = post.comments
        }
        console.log("getResponse..",getResponse)       
        const putResponse = await this.postRepository.put(getResponse)
        if(putResponse) {
            return {
                code: 200,
                success: true,
                message: 'Post updated successfully'
            };
        }        
    }
}

module.exports = EmployeeService;