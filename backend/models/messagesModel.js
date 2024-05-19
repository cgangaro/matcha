const BaseModel = require('./baseModel');

class MessagesModel extends BaseModel {
    constructor() {
        super();
        this.tableName = 'messages';
    }

    async check(values) {
        const item = await this.findMultiple(["author_id", "recipient_id"], values)
        if (item) {
            return true;
        }
        return false;
    }

    async deleteUserMessages(userId) {
        const count = await this.deleteMultipleOrConditions(["author_id", "recipient_id"], [userId, userId]);
        return count;
    }
}
module.exports = new MessagesModel();