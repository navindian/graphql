const BaseRepository = require('../repository/BaseRepository')
class HashTagRespository extends BaseRepository {
    constructor(client) {
        super(client, 'hashtag')
    }
}

module.exports = HashTagRespository;