const BaseController = require('./baseController');
const LikesModel = require('../models/likesModel');
const UserController = require('../controllers/userController');
const BlocksController = require('../controllers/blocksController');

const LIKE_FAME_RATING_VALUE = 10;

class LikesController extends BaseController {
    constructor() {
        super(LikesModel);
    }

    async getAllByAuthorId(req, res) { //doesnt work ! look getAllByRecipientId
        try {
            const authorId = this._checkPositiveInteger(req.params.id || '');
            if (authorId < 0) {
                res.status(400).json({ error: "Author id is incorrect" });
                return;
            }
            const likes = await this.model.findMultiple(["author_id"], [authorId])
            if (!likes) {
                res.status(404).json({ error: 'Like not found' })
                return;
            } else {
                var likesReturn = [];
                likes.find((row) => row).forEach(element => {
                    likesReturn.push(element);
                });
                res.json(likesReturn);
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getAllByRecipientId(req, res) {
        try {
            const recipientId = req.params.id;
            const likes = await this.model.findMultiple(["recipient_id"], [recipientId])
            if (likes) {
                var likesFind = [];
                likes.find((row) => row).forEach(element => {
                    likesFind.push(element);
                });
                var likesReturnData = [];
                for (var i = 0; i < likesFind.length; i++) {
                    const user = await UserController.model.findById(likesFind[i].author_id);
                    if (user) {
                        likesReturnData.push({ authorId: user.id, authorUsername: user.username, authorFirstName: user.first_name, authorLastName: user.last_name, recipientId: likesFind[i].recipient_id });
                    }
                }
                res.status(200).json({ data: likesReturnData });
            } else {
                res.status(200).json({ data: [] });
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getLikeById(req, res) {
        try {
            const likeId = this._checkPositiveInteger(req.params.id || '');
            if (likeId < 0) {
                res.status(400).json({ error: 'Like id is incorrect' });
                return;
            }
            const like = await this.model.findById(likeId);
            if (!like) {
                res.status(404).json({ error: 'Like not found' })
                return;
            } else {
                res.json(like);
            }
            return;
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getCheckLike(req, res) {
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

    async getMatches(req, res) {
        try {
            const userId = req.user.userId;
            const likes = await this.model.findMultiple(["author_id"], [userId]);
            if (!likes) {
                res.status(404).json({ error: 'Likes not found' });
                return;
            }
            let matches = [];
            var likesReturn = [];
            likes.find((row) => row).forEach(element => {
                likesReturn.push(element);
            });
            for (var i = 0; i < likesReturn.length; i++) {
                const like = likesReturn[i];
                if (await this.model.check([like.recipient_id, userId])) {
                    matches.push(like.recipient_id);
                }
            }
            return res.status(200).json(matches);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getCheckMatch(req, res) {
        try {
            const likeData = req.params;
            const authorId = likeData.authorId;
            const recipientId = likeData.recipientId;
            if (await this.model.check([authorId, recipientId]) && await this.model.check([recipientId, authorId])) {
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

    async createLike(req, res) {
        try {
            const likeData = req.body;
            const authorId = likeData.authorId;
            const recipientId = likeData.recipientId;
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
                res.status(400).json({ error: "Like already exists" });
                return;
            }
            const data = {
                "author_id": authorId,
                "recipient_id": recipientId
            };
            const likeId = await this.model.create(data);
            await UserController._updateFameRating(LIKE_FAME_RATING_VALUE, recipientId);
            res.status(201).json({ message: 'Like created', likeId });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async deleteLikeById(req, res) {
        try {
            const likeData = req.body;
            const likeId = this._checkPositiveInteger(likeData.id || '');
            if (likeId < 0) {
                res.status(400).json({ error: "Like id is incorrect" });
                return;
            }
            if (!await this.checkById(likeId)) {
                res.status(400).json({ error: "Like doesn't exists" });
                return;
            }
            const likeIdReturn = await this.model.delete(likeId);
            res.status(201).json({ message: 'like deleted', likeIdReturn });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async deleteLike(req, res) {
        try {
            const likeData = req.body;
            const authorId = likeData.authorId;
            const recipientId = likeData.recipientId;
            const count = await this.model.deleteLike(authorId, recipientId);
            const deleted = (count > 0) ? true : false
            await UserController._updateFameRating(-LIKE_FAME_RATING_VALUE, recipientId);
            res.status(201).json({ message: 'Like deleted', deleted: deleted });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async _checkLike(authorId, recipientId) {
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

module.exports = new LikesController();