const baseValidator = require("./validators/baseValidator");

class MessagesDTO extends baseValidator {
    constructor() {
        super();
    }

    createMessage(message, author_id, recipient_id) {
        super.fieldIsRequired("message", message);
        super.fieldIsRequired("author_id", author_id);
        super.fieldIsRequired("recipient_id", recipient_id);

        if (this.isValid()) {
            super.validateString("message", message, 1, 255);
            super.validatePositiveInteger("author_id", author_id);
            super.validatePositiveInteger("recipient_id", recipient_id);
        }
        return this.isValid();
    }

    getConversation(authorId, recipientId) {
        super.fieldIsRequired("authorId", authorId);
        super.fieldIsRequired("recipientId", recipientId);

        if (this.isValid()) {
            super.validatePositiveInteger("authorId", authorId);
            super.validatePositiveInteger("recipientId", recipientId);
        }
        return this.isValid();
    }
}

module.exports = MessagesDTO;