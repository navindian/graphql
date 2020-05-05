'use strict';
const AWS = require('aws-sdk');
// update the region
AWS.config.update({ region: 'ap-south-1' });
// update the credentials
AWS.config.update({
    accessKeyId: 'xxx',
    secretAccessKey: 'xxx',
});
let dynamoDBClient = new AWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000'
});

// export for further use
module.exports = dynamoDBClient;
