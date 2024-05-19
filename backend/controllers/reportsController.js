const BaseController = require('./baseController');
const ReportsModel = require('../models/reportsModel');
const UserController = require('../controllers/userController');

class ReportsController extends BaseController {
    constructor() {
        super(ReportsModel);
    }

    async getAllByAuthorId(req, res) {
        try {
            const authorId = this._checkPositiveInteger(req.params.id || '');
            if (authorId < 0) {
                res.status(400).json({ error: "Author id is incorrect" });
                return ;
            }
            const reports = await this.model.findMultiple(["author_id"], [authorId])
            if (!reports) {
                res.status(404).json({ error: 'Report not found' })
                return ;
            } else {
                var reportsReturn = [];
                reports.find((row) => row).forEach(element => {
                    reportsReturn.push(element);
                });
                res.json(reportsReturn);
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
                return ;
            }
            const reports = await this.model.findMultiple(["recipient_id"], [recipientId])
            if (!reports) {
                res.status(404).json({ error: 'Report not found' })
                return ;
            } else {
                var reportsReturn = [];
                reports.find((row) => row).forEach(element => {
                    reportsReturn.push(element);
                });
                res.json(reportsReturn);
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getReportById(req, res) {
        try {
            const reportId = this._checkPositiveInteger(req.params.id || '');
            if (reportId < 0) {
                res.status(400).json({ error: 'Report id is incorrect' });
                return ;
            }
            const report = await this.model.findById(reportId);
            if (!report) {
                res.status(404).json({ error: 'Report not found' })
                return ;
            } else {
                res.json(report);
            }
            return ;
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getCheckReport(req, res) {
        try {
            const authorId = this._checkPositiveInteger(req.params.authorId || '');
            if (authorId < 0) {
                res.status(400).json({ error: 'Author id is incorrect' });
                return ;
            }
            const recipientId = this._checkPositiveInteger(req.params.recipientId || '');
            if (recipientId < 0) {
                res.status(400).json({ error: 'Recipient id is incorrect' });
                return ;
            }
            if (await this.model.check([authorId, recipientId])) {
                res.status(200).json({ exist: true });
                return ;
            } else {
                res.status(200).json({ exist: false });
                return ;
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async createReport(req, res) {
        try {
            const authorId = req.body.author_id;
            const recipientId = req.body.recipient_id;
            if (authorId == recipientId) {
                res.status(400).json({ error: "Author id  and recipient id is equal" });
                return ;
            }
            if (!await UserController.checkById(authorId)) {
                res.status(400).json({ error: "Author id doesn't exists" });
                return ;
            }
            if (!await UserController.checkById(recipientId)) {
                res.status(400).json({ error: "Recipient id doesn't exists" });
                return ;
            }
            if (await this.model.check([authorId, recipientId])) {
                res.status(400).json({ error: "Report already exists" });
                return ;
            }
            const data = {
                "author_id": authorId,
                "recipient_id": recipientId
            };
            const reportId = await this.model.create(data);
            res.status(201).json({ message: 'Report created', reportId });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async deleteReportByUsersId(req, res) {
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
            const reportId = await this.model.getReportByUsersId([authorId, recipientId]);
            if (!reportId) {
                res.status(400).json({ error: "Report doesn't exists" });
                return;
            }
            if (await this.model.delete(reportId))
                res.status(201).json({ message: 'Report deleted', reportId });
            else
                res.status(500).json({ error: 'Internal Server Error' });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async deleteReport(req, res) {
        try {
            const reportData = req.body;
            const reportId = this._checkPositiveInteger(reportData.id || '');
            if (reportId < 0) {
                res.status(400).json({ error: "Report id is incorrect" });
                return ;
            }
            if (!await this.checkById(reportId)) {
                res.status(400).json({ error: "Report doesn't exists" });
                return ;
            }
            const reportIdReturn = await this.model.delete(reportId);
            res.status(201).json({ message: 'report deleted', reportIdReturn });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = new ReportsController();