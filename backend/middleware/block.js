const BlockDTO = require("../dto/blockDTO");

getAllByAuthorId = (req, res, next) => {
    try {
        const id = req.params.id;
        const blockDTO = new BlockDTO();
        const isValid = BlockDTO.validateId(id);
        if (!isValid) {
            return res.status(400).json(blockDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
}

getBlockById = (req, res, next) => {
    try {
        const id = req.params.id;
        const blockDTO = new BlockDTO();
        const isValid = blockDTO.validateId(id);
        if (!isValid) {
            return res.status(400).json(blockDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
}

getCheckBlock = (req, res, next) => {
    try {
        const author_id = req.params.authorId;
        const recipient_id = req.params.recipientId;
        const blockDTO = new BlockDTO();
        const isValid = blockDTO.validateAuthorIdAndRecipientId(author_id, recipient_id);
        if (!isValid) {
            return res.status(400).json(blockDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
}

createBlock = (req, res, next) => {
    try {
        const { author_id, recipient_id } = req.body;
        const blockDTO = new BlockDTO();
        const isValid = blockDTO.validateAuthorIdAndRecipientId(author_id, recipient_id);
        if (!isValid) {
            return res.status(400).json(blockDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
}

deleteBlock = (req, res, next) => {
    try {
        const blockId = req.body.id;
        const blockDTO = new BlockDTO();
        const isValid = blockDTO.validateId(blockId);
        if (!isValid) {
            return res.status(400).json(blockDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
}

deleteBlockByUsersId = (req, res, next) => {
    try {
        const { author_id, recipient_id } = req.body;
        const blockDTO = new BlockDTO();
        const isValid = blockDTO.validateAuthorIdAndRecipientId(author_id, recipient_id);
        if (!isValid) {
            return res.status(400).json(blockDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
}

module.exports = {
    getAllByAuthorId,
    getBlockById,
    getCheckBlock,
    createBlock,
    deleteBlock,
    deleteBlockByUsersId
}