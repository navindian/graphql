class BaseRepository {
    constructor(client, table) {
        this.client = client;
        this.table = table;
    }
    async get(key) {
        const request = {
            Key: key,
            TableName: this.table,
        };
        try {
            const response = await this.client.get(request).promise();
            return response.Item;
        }
        catch (error) {
            throw new Error(error);
        }
    }
    async put(item) {
        const request = {
            TableName: this.table,
            Item: item,
        };
        try {
            await this.client.put(request).promise();
        }
        catch (error) {
            throw new Error(error);
        }
        return true;
    }    
    async query(params) {
        const request = {
            TableName: this.table,
        };
        if (params.keyConditionExpression) {
            request.KeyConditionExpression = params.keyConditionExpression;
        }
        if (params.expressionAttributeValues) {
            request.ExpressionAttributeValues = params.expressionAttributeValues;
        }
        if (params.indexName) {
            request.IndexName = process.env.ENVIRONMENT + '-' + params.indexName;
        }
        if (params.projectionExpression) {
            request.ProjectionExpression = params.projectionExpression;
        }
        if (params.FilterExpression) {
            request.FilterExpression = params.FilterExpression;
        }
        if (params.select) {
            request.Select = params.select;
        }

        if (typeof params.scanIndexForward !== 'undefined') {
            request.ScanIndexForward = params.scanIndexForward;
        }
        try {
            const response = this.client.query(request).promise()
            return response;
        }
        catch (error) {
            throw new Error(error);
        }
    }
    async scan() {
        const request = {
            TableName: this.table,
        };
        try {
            const response = this.client.scan(request).promise();
            return response;
        }
        catch (error) {
            throw new Error(error);
        }
    }

    async delete(key) {
        const request = {
            TableName: this.table,
            Key: key,
        };
        try {
            await this.client.delete(request).promise();
            return true;
        }
        catch (error) {
            throw new Error(error);
        }
    }
}
module.exports = BaseRepository;