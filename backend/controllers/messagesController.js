const BaseController = require('./baseController');
const MessagesModel = require('../models/messagesModel');
const UserController = require('../controllers/userController');
const BlocksController = require('../controllers/blocksController');
const LikesController = require('../controllers/likesController');

class MessagesController extends BaseController {
    constructor() {
        super(MessagesModel);
    }

    async getConversation(req, res) {
        try {
            const messageData = req.params;
            const authorId = this._checkPositiveInteger(messageData.authorId || '');
            if (authorId < 0) {
                res.status(400).json({ error: "Author id is incorrect" });
                return;
            }
            const recipientId = this._checkPositiveInteger(messageData.recipientId || '');
            if (recipientId < 0) {
                res.status(400).json({ error: "Recipient id is incorrect" });
                return;
            }
            if (authorId == recipientId) {
                res.status(400).json({ error: "Author id  and recipient id is equal" });
                return;
            }
            if (!await UserController.checkById(authorId)) {
                res.status(400).json({ error: "Author id doesn't exists" });
                return;
            }
            if (!await UserController.checkById(recipientId)) {
                res.status(400).json({ error: "Recipient id doesn't exists" });
                return;
            }
            const messagesAuthor = await this.model.findMultiple(["author_id", "recipient_id"], [authorId, recipientId]);
            const messagesRecipient = await this.model.findMultiple(["author_id", "recipient_id"], [recipientId, authorId]);
            if (!messagesAuthor && !messagesRecipient) {
                res.status(404).json({ error: 'Message not found' })
                return;
            } else {
                var messages = [];
                if (messagesAuthor) {
                    messagesAuthor.find((row) => row).forEach(element => {
                        messages.push(element);
                    });
                }
                if (messagesRecipient) {
                    messagesRecipient.find((row) => row).forEach(element => {
                        messages.push(element);
                    });
                }
                const messagesReturn = this._sortMessagesByDate(messages);
                res.json(messagesReturn);
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getAllByAuthorId(req, res) {
        try {
            const authorId = this._checkPositiveInteger(req.params.id || '');
            if (authorId < 0) {
                res.status(400).json({ error: "Author id is incorrect" });
                return;
            }
            const messages = await this.model.findMultiple(["author_id"], [authorId])
            if (!messages) {
                res.status(404).json({ error: 'Message not found' })
                return;
            } else {
                var messagesReturn = [];
                messages.find((row) => row).forEach(element => {
                    messagesReturn.push(element);
                });
                res.json(messagesReturn);
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getAllByRecipientId(req, res) {
        try {
            const recipientId = this._checkPositiveInteger(req.params.id || '');
            if (recipientId < 0) {
                res.status(400).json({ error: "Recipient id is incorrect" });
                return;
            }
            const messages = await this.model.findMultiple(["recipient_id"], [recipientId])
            if (!messages) {
                res.status(404).json({ error: 'Message not found' })
                return;
            } else {
                var messagesReturn = [];
                messages.find((row) => row).forEach(element => {
                    messagesReturn.push(element);
                });
                res.json(messagesReturn);
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getMessageById(req, res) {
        try {
            const messageId = this._checkPositiveInteger(req.params.id || '');
            if (messageId < 0) {
                res.status(400).json({ error: 'Message id is incorrect' });
                return;
            }
            const message = await this.model.findById(messageId);
            if (!message) {
                res.status(404).json({ error: 'Message not found' })
                return;
            } else {
                res.json(message);
            }
            return;
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async createMessage(req, res) {
        try {
            const messageData = req.body;
            const authorId = this._checkPositiveInteger(messageData.author_id || '');
            if (authorId < 0) {
                res.status(400).json({ error: "Author id is incorrect" });
                return;
            }
            const recipientId = this._checkPositiveInteger(messageData.recipient_id || '');
            if (recipientId < 0) {
                res.status(400).json({ error: "Recipient id is incorrect" });
                return;
            }
            if (authorId == recipientId) {
                res.status(400).json({ error: "Author id  and recipient id is equal" });
                return;
            }
            if (!await UserController.checkById(authorId)) {
                res.status(400).json({ error: "Author id doesn't exists" });
                return;
            }
            if (!await UserController.checkById(recipientId)) {
                res.status(400).json({ error: "Recipient id doesn't exists" });
                return;
            }
            const checkBlock = await BlocksController._checkBlock(authorId, recipientId);
            if (checkBlock == true) {
                res.status(400).json({ error: "Relationship is blocked" });
                return;
            } else if (checkBlock != false) {
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }
            const checkLike = await LikesController._checkLike(authorId, recipientId);
            if (checkLike == false) {
                res.status(400).json({ error: "Match doesn't exist" });
                return;
            } else if (checkLike != true) {
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }
            const checkMessage = this._checkString(messageData.message || '', 'Message', 300, /^[0-9a-zA-Z~`!@#$%^&*()+=_-{}[\]|:;"'><,.?/ ]+$/);
            if (checkMessage != true) {
                res.status(400).json({ error: checkMessage });
                return;
            }
            const data = {
                "author_id": authorId,
                "recipient_id": recipientId,
                "message": messageData.message,
                "date": this._getTimestampString()
            };
            const messageId = await this.model.create(data);
            res.status(201).json({ message: 'Message created', messageId, data });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async deleteMessage(req, res) {
        try {
            const messageData = req.body;
            const messageId = this._checkPositiveInteger(messageData.id || '');
            if (messageId < 0) {
                res.status(400).json({ error: "Message id is incorrect" });
                return;
            }
            if (!await this.checkById(messageId)) {
                res.status(400).json({ error: "Message doesn't exists" });
                return;
            }
            const messageIdReturn = await this.model.delete(messageId);
            res.status(201).json({ message: 'message deleted', messageIdReturn });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    _sortMessagesByDate(messages) {
        messages.sort((message1, message2) => {
            return Date.parse(message2.date) - Date.parse(message1.date);
        });
        return messages;
    }
}

module.exports = new MessagesController();