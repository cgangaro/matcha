const MessagesDTO = require("../dto/messagesDTO");

createMessage = (req, res, next) => {
    try {
        const { message, author_id, recipient_id } = req.body;
        const messagesDTO = new MessagesDTO();
        const isValid = messagesDTO.createMessage(message, author_id, recipient_id);
        if (!isValid) {
            return res.status(400).json(messagesDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
}

getConversation = (req, res, next) => {
    try {
        const { authorId, recipientId } = req.params;
        const messagesDTO = new MessagesDTO();
        const isValid = messagesDTO.getConversation(authorId, recipientId);
        if (!isValid) {
            return res.status(400).json(messagesDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
}

module.exports = {
    createMessage,
    getConversation
}