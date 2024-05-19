const BaseModel = require('./baseModel');

class BlocksModel extends BaseModel {
    constructor() {
        super();
        this.tableName = 'blocks';
    }

    async check(values) {
        const item = await this.findMultiple(["author_id", "recipient_id"], values)
        if (item) {
            return true;
        }
        return false;
    }

    async checkRelation(values) {
        const item = await this.findMultiple(["author_id", "recipient_id"], values)
        const item2 = await this.findMultiple(["recipient_id", "author_id"], values)
        if (item || item2) {
            return true;
        }
        return false;
    }

    async getBlockByUsersId(values) {
        const item = await this.findMultiple(["author_id", "recipient_id"], values)
        if (item) {
            return item[0][0].id || null;
        }
        return null;
    }

    async deleteUserBlocks(userId) {
        const count = await this.deleteMultipleOrConditions(["author_id", "recipient_id"], [userId, userId]);
        return count;
    }
}
module.exports = new BlocksModel();