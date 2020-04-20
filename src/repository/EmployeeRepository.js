const BaseRepository = require('../repository/BaseRepository')
class EmployeeRespository extends BaseRepository {
    constructor(client) {
        super(client, 'employee')
    }
}

module.exports = EmployeeRespository;