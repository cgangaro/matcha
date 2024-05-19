const LikeDTO = require("../dto/likeDTO");

getCheckLike = (req, res, next) => {
    try {
        const authorId = req.params.authorId;
        const recipientId = req.params.recipientId;

        const likeDTO = new LikeDTO();
        const isValid = likeDTO.getCheckLike(authorId, recipientId);
        if (!isValid) {
            return res.status(400).json(likeDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
};

getCheckMatch = (req, res, next) => {
    try {
        const authorId = req.params.authorId;
        const recipientId = req.params.recipientId;

        const likeDTO = new LikeDTO();
        const isValid = likeDTO.getCheckMatch(authorId, recipientId);
        if (!isValid) {
            return res.status(400).json(likeDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
};


createLike = (req, res, next) => {
    try {
        const authorId = req.body.authorId;
        const recipientId = req.body.recipientId;

        const likeDTO = new LikeDTO();
        const isValid = likeDTO.createLike(authorId, recipientId);
        if (!isValid) {
            return res.status(400).json(likeDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
};

deleteLike = (req, res, next) => {
    try {
        const authorId = req.body.authorId;
        const recipientId = req.body.recipientId;

        const likeDTO = new LikeDTO();
        const isValid = likeDTO.deleteLike(authorId, recipientId);
        if (!isValid) {
            return res.status(400).json(likeDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
};

getAllByRecipientId = (req, res, next) => {
    try {
        const recipientId = req.params.id;
        const likeDTO = new LikeDTO();
        const isValid = likeDTO.getAllByRecipientId(recipientId);
        if (!isValid) {
            return res.status(400).json(likeDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
};

getMatches = (req, res, next) => {
    try {
        const id = req.params.id;
        const likeDTO = new LikeDTO();
        const isValid = likeDTO.getMatches(id);
        if (!isValid) {
            return res.status(400).json(likeDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
};

module.exports = {
    getCheckLike,
    getCheckMatch,
    createLike,
    deleteLike,
    getAllByRecipientId,
    getMatches
};