const baseValidator = require("./validators/baseValidator");

class BlockDTO extends baseValidator {
	constructor() {
		super();
	}

	validateId(id) {
		super.fieldIsRequired('id', id);
		super.validatePositiveInteger('id', id);
		return this.isValid();
	}

	validateAuthorIdAndRecipientId(author_id, recipient_id) {
		super.fieldIsRequired('author_id', author_id);
		super.fieldIsRequired('recipient_id', recipient_id)
		super.validatePositiveInteger('author_id', author_id);
		super.validatePositiveInteger('recipient_id', recipient_id);
		return this.isValid();
	}
}

module.exports = BlockDTO;