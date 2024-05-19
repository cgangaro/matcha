const BaseController = require('./baseController');
const BlocksModel = require('../models/blocksModel');
const UserController = require('../controllers/userController');

class BlocksController extends BaseController {
    constructor() {
        super(BlocksModel);
    }

    async getAllByAuthorId(req, res) {
        try {
            const authorId = req.params.id;
            const blocks = await this.model.findMultiple(["author_id"], [authorId])
            if (!blocks) {
                res.status(404).json({ error: 'Block not found' })
                return;
            } else {
                var blocksReturn = [];
                blocks.find((row) => row).forEach(element => {
                    blocksReturn.push(element);
                });
                res.json(blocksReturn);
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getBlockById(req, res) {
        try {
            const blockId = req.params.id;
            const block = await this.model.findById(blockId);
            if (!block) {
                res.status(404).json({ error: 'Block not found' })
                return;
            } else {
                res.json(block);
            }
            return;
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getCheckBlock(req, res) {
        try {
            const authorId = req.params.authorId;
            const recipientId = req.params.recipientId;
            var blocksReturn = [];
            if (await this.model.check([authorId, recipientId])) {
                let blocks = await this.model.findMultiple(["author_id", "recipient_id"], [authorId, recipientId]);
                blocks.find((row) => row).forEach(element => {
                    blocksReturn.push(element);
                });
                res.status(200).json({ exist: true, data: blocksReturn });
                return;
            } else if (await this.model.check([recipientId, authorId])) {
                let blocks = await this.model.findMultiple(["author_id", "recipient_id"], [recipientId, authorId]);
                blocks.find((row) => row).forEach(element => {
                    blocksReturn.push(element);
                });
                res.status(200).json({ exist: true, data: blocksReturn });
                return;
            } else {
                res.status(200).json({ exist: false });
                return;
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async createBlock(req, res) {
        try {
            const authorId = req.body.author_id;
            const recipientId = req.body.recipient_id;
            if (authorId == recipientId) {
                res.status(400).json({ error: "Author id are recipient id is equal" });
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
            if (await this.model.check([authorId, recipientId])) {
                res.status(400).json({ error: "Block already exists" });
                return;
            }
            const data = {
                "author_id": authorId,
                "recipient_id": recipientId
            };
            const blockId = await this.model.create(data);
            res.status(201).json({ message: 'Block created', blockId: blockId, data: data });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async deleteBlock(req, res) {
        try {
            const blockId = req.body.id;
            if (!await this.checkById(blockId)) {
                res.status(400).json({ error: "Block doesn't exists" });
                return;
            }
            if (await this.model.delete(blockId))
                res.status(201).json({ message: 'Block deleted', blockId });
            else
                res.status(500).json({ error: 'Internal Server Error' });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async deleteBlockByUsersId(req, res) {
        try {
            const authorId = req.body.author_id;
            const recipientId = req.body.recipient_id;
            if (authorId == recipientId) {
                res.status(400).json({ error: "Author id are recipient id is equal" });
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
            const blockId = await this.model.getBlockByUsersId([authorId, recipientId]);
            if (!blockId) {
                res.status(400).json({ error: "Block doesn't exists" });
                return;
            }
            const data = {
                "author_id": authorId,
                "recipient_id": recipientId
            };
            if (await this.model.delete(blockId))
                res.status(201).json({ message: 'Block deleted', blockId: blockId, data: data});
            else
                res.status(500).json({ error: 'Internal Server Error' });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async _checkBlock(authorId, recipientId) {
        try {
            if (await this.model.check([authorId, recipientId])) {
                return true;
            } else if (await this.model.check([recipientId, authorId])) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            return error;
        }
    }
}

module.exports = new BlocksController();