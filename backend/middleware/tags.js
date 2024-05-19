const TagsDTO = require("../dto/tagsDTO");

getAllByOwnerId = (req, res, next) => {
    try {
        const id = req.params.id;
        const tagsDTO = new TagsDTO();
        const isValid = tagsDTO.validateId(id);
        if (!isValid) {
            return res.status(400).json(tagsDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
}

module.exports = {
    getAllByOwnerId
}