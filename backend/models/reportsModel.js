const BaseModel = require('./baseModel');

class ReportsModel extends BaseModel {
    constructor() {
        super();
        this.tableName = 'reports';
    }

    async check(values) {
        const item = await this.findMultiple(["author_id", "recipient_id"], values)
        if (item) {
            return true;
        }
        return false;
    }

    async deleteUserReports(userId) {
        const count = await this.deleteMultipleOrConditions(["author_id", "recipient_id"], [userId, userId]);
        return count;
    }

    async getReportByUsersId(values) {
        const item = await this.findMultiple(["author_id", "recipient_id"], values)
        if (item) {
            return item[0][0].id || null;
        }
        return null;
    }
}
module.exports = new ReportsModel();