const express = require('express');
const ReportsController = require('../controllers/reportsController');
const router = express.Router();
const auth = require('../middleware/auth');
const report = require('../middleware/report');

router.post('/create', auth, report.createReport, async (req, res) => {
    try {
        await ReportsController.createReport(req, res);
    } catch (error) {
        console.log(error);
    }
});

router.post('/delete/users', auth, report.deleteReportByUsersId, async (req, res) => {
    try {
        await ReportsController.deleteReportByUsersId(req, res);
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;