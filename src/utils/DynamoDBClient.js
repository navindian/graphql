'use strict';
const AWS = require('aws-sdk');
// update the region
AWS.config.update({ region: 'ap-south-1' });
AWS.profile = 'default';
const credentials = new AWS.SharedIniFileCredentials({profile: 'default'});
AWS.config.credentials = credentials;
let dynamoDBClient = new AWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000'
});

// export for further use
module.exports = dynamoDBClient;
