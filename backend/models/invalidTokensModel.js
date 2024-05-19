const BaseModel = require('./baseModel');

class InvalidTokensModel extends BaseModel {
    constructor() {
        super();
        this.tableName = 'invalidTokens';
    }

    async check(value) {
        const item = await this.findOne('token', value)
        if (item) {
            return true;
        }
        return false;
    }
}
module.exports = new InvalidTokensModel();