const baseValidator = require("./validators/baseValidator");

class LikeDTO extends baseValidator {
    constructor() {
        super();
    }

    getCheckLike(authorId, recipientId) {
        super.fieldIsRequired('authorId', authorId);
        super.validatePositiveInteger('authorId', authorId);

        super.fieldIsRequired('recipientId', recipientId);
        super.validatePositiveInteger('recipientId', recipientId);

        return this.isValid();
    }

    getCheckMatch(authorId, recipientId) {
        super.fieldIsRequired('authorId', authorId);
        super.validatePositiveInteger('authorId', authorId);

        super.fieldIsRequired('recipientId', recipientId);
        super.validatePositiveInteger('recipientId', recipientId);

        return this.isValid();
    }

    deleteLike(authorId, recipientId) {
        super.fieldIsRequired('authorId', authorId);
        super.validatePositiveInteger('authorId', authorId);

        super.fieldIsRequired('recipientId', recipientId);
        super.validatePositiveInteger('recipientId', recipientId);

        return this.isValid();
    }

    createLike(authorId, recipientId) {
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

    getMatches(id) {
        super.fieldIsRequired('id', id);
        super.validatePositiveInteger('id', id);

        return this.isValid();
    }
}

module.exports = LikeDTO;