const express = require('express');
const MessagesController = require('../controllers/messagesController');
const router = express.Router();
const auth = require('../middleware/auth');
const messages = require('../middleware/messages');

router.get('/:authorId/:recipientId', auth, messages.getConversation, async (req, res) => {
    try {
        await MessagesController.getConversation(req, res);
    } catch (error) {
        console.log(error);
    }
});

router.post('/create', auth, messages.createMessage, async (req, res) => {
    try {
        await MessagesController.createMessage(req, res);
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;