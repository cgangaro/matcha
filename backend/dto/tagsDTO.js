const baseValidator = require("./validators/baseValidator");

class TagsDTO extends baseValidator {
    constructor() {
        super();
    }

    validateId(id) {
        super.fieldIsRequired("id", id);
        super.validatePositiveInteger("id", id);
        return this.isValid();
    }
}

module.exports = TagsDTO;