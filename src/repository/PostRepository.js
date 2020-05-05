const BaseRepository = require('../repository/BaseRepository')
class PostRespository extends BaseRepository {
    constructor(client) {
        super(client, 'post');
        this.client = client;
        this.table = 'post'
    }
    async update(post, field) {
        const params = {
            TableName: this.table,
            Key: { id: post.id }
        }
        if (field === "likes") {
            params.UpdateExpression =
                'SET #likes =:likes',
                params.ExpressionAttributeNames = {
                    '#likes': 'likes',
                },
                params.ExpressionAttributeValues = {
                    ':likes': post.likes,
                }
        }
        else if (field === "comments") {
            params.UpdateExpression =
                'SET #comments =:comments',
                params.ExpressionAttributeNames = {
                    '#comments': 'comments'
                },
                params.ExpressionAttributeValues = {
                    ':comments': post.comments
                }
        }
        try {
            await this.client.update(params).promise();
        }
        catch (error) {
            throw new Error(error);
        }
        return true;
    }
}

module.exports = PostRespository;