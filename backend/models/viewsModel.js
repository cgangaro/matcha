const BaseModel = require('./baseModel');

class ViewsModel extends BaseModel {
    constructor() {
        super();
        this.tableName = 'views';
    }

    async check(values) {
        const item = await this.findMultiple(["author_id", "recipient_id"], values)
        if (item) {
            return true;
        }
        return false;
    }

    async deleteUserViews(userId) {
        const count = await this.deleteMultipleOrConditions(["author_id", "recipient_id"], [userId, userId]);
        return count;
    }
}
module.exports = new ViewsModel();