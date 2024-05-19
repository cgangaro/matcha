const BaseModel = require('./baseModel');

class TagsModel extends BaseModel {
    constructor() {
        super();
        this.tableName = 'tags';
    }

    async check(values) {
        const item = await this.findMultiple(["name", "owner_id"], values)
        if (item) {
            return true;
        }
        return false;
    }

    async deleteUserTags(userId) {
        const count = await this.deleteMultipleOrConditions(["owner_id"], [userId]);
        return count;
    }

    async addUserTags(tags, userId) {
        for (var y = 0; y < tags.length; y++) {
            const data = {
                "name": tags[y],
                "owner_id": userId
            };
            const tagId = await this.create(data);
        }
        return true;
    }

    async getAllUserTags(userId) {
        const tags = await this.findMultiple(["owner_id"], [userId])
        if (!tags) {
            return null;
        } else {
            var tagsReturn = [];
            tags.find((row) => row).forEach(element => {
                tagsReturn.push(element.name);
            });
            return tagsReturn;
        }
    }

}
module.exports = new TagsModel();