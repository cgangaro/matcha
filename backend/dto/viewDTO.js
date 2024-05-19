const baseValidator = require("./validators/baseValidator");

class ViewDTO extends baseValidator {
    constructor() {
        super();
    }

    createView(authorId, recipientId) {
        super.fieldIsRequired('authorId', authorId);
        super.validatePositiveInteger('authorId', authorId);

        super.fieldIsRequired('recipientId', recipientId);
        super.validatePositiveInteger('recipientId', recipientId);

        return this.isValid();
    }

    getAllByRecipientId(recipientId) {

        super.fieldIsRequired('recipientId', recipientId);
        super.validatePositiveInteger('recipientId', recipientId);

        return this.isValid();
    }
}

module.exports = ViewDTO;