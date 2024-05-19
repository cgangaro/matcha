const express = require('express');
const ViewsController = require('../controllers/viewsController');
const router = express.Router();
const auth = require('../middleware/auth');
const view = require('../middleware/view');

router.get('/recipient/:id', auth, view.getAllByRecipientId, async (req, res) => {
    try {
        await ViewsController.getAllByRecipientId(req, res);
    } catch (error) {
        console.log(error);
    }
});


router.post('/create', auth, view.createView, async (req, res) => {
    try {
        await ViewsController.createView(req, res);
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;