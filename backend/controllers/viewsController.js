const BaseController = require('./baseController');
const ViewsModel = require('../models/viewsModel');
const UserController = require('../controllers/userController');
const BlocksController = require('../controllers/blocksController');

const VIEW_FAME_RATING_VALUE = 1;

class ViewsController extends BaseController {
    constructor() {
        super(ViewsModel);
    }

    async getAllByAuthorId(req, res) { //doesnt work ! look getAllByRecipientId
        try {
            const authorId = this._checkPositiveInteger(req.params.id || '');
            if (authorId < 0) {
                res.status(400).json({ error: "Author id is incorrect" });
                return;
            }
            const views = await this.model.findMultiple(["author_id"], [authorId])
            var viewsReturn = [];
            views.find((row) => row).forEach(element => {
                const user = UserController.model.findById(element.author_id);
                if (user) {
                    viewsReturn.push({ authorId: user.id, authorUsername: user.username, authorFirstName: user.first_name, authorLastName: user.last_name, recipientId: element.recipient_id });
                }
            });
            res.json(viewsReturn);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getAllByRecipientId(req, res) {
        try {
            const recipientId = req.params.id;
            const views = await this.model.findMultiple(["recipient_id"], [recipientId])
            if (views) {
                var viewsReturn = [];
                views.find((row) => row).forEach(element => {
                    const user = UserController.model.findById(element.author_id);
                    if (user) {
                        viewsReturn.push({ authorId: user.id, authorUsername: user.username, authorFirstName: user.first_name, authorLastName: user.last_name, recipientId: element.recipient_id });
                    }
                });
                res.status(200).json({ data: viewsReturn });
            }
            res.status(200).json({ data: [] });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getAllByRecipientId(req, res) {
        try {
            const recipientId = req.params.id;
            const views = await this.model.findMultiple(["recipient_id"], [recipientId])
            if (views) {
                var viewsFind = [];
                views.find((row) => row).forEach(element => {
                    viewsFind.push(element);
                });
                var viewsReturnData = [];
                for (var i = 0; i < viewsFind.length; i++) {
                    const user = await UserController.model.findById(viewsFind[i].author_id);
                    if (user) {
                        viewsReturnData.push({ authorId: user.id, authorUsername: user.username, authorFirstName: user.first_name, authorLastName: user.last_name, recipientId: viewsFind[i].recipient_id });
                    }
                }
                res.status(200).json({ data: viewsReturnData });
            } else {
                res.status(200).json({ data: [] });
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getViewById(req, res) {
        try {
            const viewId = this._checkPositiveInteger(req.params.id || '');
            if (viewId < 0) {
                res.status(400).json({ error: 'View id is incorrect' });
                return;
            }
            const view = await this.model.findById(viewId);
            if (!view) {
                res.status(404).json({ error: 'View not found' })
                return;
            } else {
                res.json(view);
            }
            return;
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getCheckView(req, res) {
        try {
            const authorId = this._checkPositiveInteger(req.params.authorId || '');
            if (authorId < 0) {
                res.status(400).json({ error: 'Author id is incorrect' });
                return;
            }
            const recipientId = this._checkPositiveInteger(req.params.recipientId || '');
            if (recipientId < 0) {
                res.status(400).json({ error: 'Recipient id is incorrect' });
                return;
            }
            if (await this.model.check([authorId, recipientId])) {
                res.status(200).json({ exist: true });
                return;
            } else {
                res.status(200).json({ exist: false });
                return;
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async createView(req, res) {
        try {
            const viewData = req.body;
            const authorId = viewData.authorId;
            const recipientId = viewData.recipientId;
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
            if (await this.model.check([authorId, recipientId])) {
                res.status(201).json({ message: "View already exists" });
                return;
            }
            const data = {
                "author_id": authorId,
                "recipient_id": recipientId
            };
            const viewId = await this.model.create(data);
            await UserController._updateFameRating(VIEW_FAME_RATING_VALUE, recipientId);
            res.status(201).json({ message: 'View created' });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async deleteView(req, res) {
        try {
            const viewData = req.body;
            const viewId = this._checkPositiveInteger(viewData.id || '');
            if (viewId < 0) {
                res.status(400).json({ error: "View id is incorrect" });
                return;
            }
            if (!await this.checkById(viewId)) {
                res.status(400).json({ error: "View doesn't exists" });
                return;
            }
            const viewIdReturn = await this.model.delete(viewId);
            res.status(201).json({ message: 'view deleted', viewIdReturn });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = new ViewsController();