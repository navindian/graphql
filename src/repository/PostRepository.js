const BaseRepository = require('../repository/BaseRepository')
class PostRespository extends BaseRepository {
    constructor(client) {
        super(client, 'post');
        this.client = client;
        this.table = 'post'
    }
    async update(post) {
        console.log("post..", post)
        const params = {
            TableName: this.table,
            Key: { id: post.id },
            UpdateExpression:
                'SET #likes =:likes, #comments =:comments',
            ExpressionAttributeNames: {
                '#likes': 'likes',
                '#comments': 'comments'
            },
            ExpressionAttributeValues: {
                ':likes': post.likes,
                ':comments': 'myy comments'
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