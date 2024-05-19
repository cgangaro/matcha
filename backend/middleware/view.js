const ViewDTO = require("../dto/viewDTO");

createView = (req, res, next) => {
    try {
        const authorId = req.body.authorId;
        const recipientId = req.body.recipientId;

        const viewDTO = new ViewDTO();
        const isValid = viewDTO.createView(authorId, recipientId);
        if (!isValid) {
            return res.status(400).json(viewDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
};

getAllByRecipientId = (req, res, next) => {
    try {
        const recipientId = req.params.id;
        const viewDTO = new ViewDTO();
        const isValid = viewDTO.getAllByRecipientId(recipientId);
        if (!isValid) {
            return res.status(400).json(viewDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
};

module.exports = {
    createView,
    getAllByRecipientId
};