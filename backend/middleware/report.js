const ReportDTO = require("../dto/reportDTO");

createReport = (req, res, next) => {
    try {
        const { author_id, recipient_id } = req.body;
        const reportDTO = new ReportDTO();
        const isValid = reportDTO.validateAuthorIdAndRecipientId(author_id, recipient_id);
        if (!isValid) {
            return res.status(400).json(reportDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
}

deleteReportByUsersId = (req, res, next) => {
    try {
        const { author_id, recipient_id } = req.body;
        const reportDTO = new ReportDTO();
        const isValid = reportDTO.validateAuthorIdAndRecipientId(author_id, recipient_id);
        if (!isValid) {
            return res.status(400).json(reportDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
}

module.exports = {
    createReport,
    deleteReportByUsersId
}