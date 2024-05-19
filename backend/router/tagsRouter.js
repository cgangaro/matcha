const express = require('express');
const TagsController = require('../controllers/tagsController');
const router = express.Router();
const auth = require('../middleware/auth');
const tags = require('../middleware/tags');

router.get('/user/:id', auth, tags.getAllByOwnerId, async (req, res) => {
    try {
        await TagsController.getAllByOwnerId(req, res);
    } catch (error) {
        console.log(error);
    }
});

router.get('/all', auth, async (req, res) => {
    try {
        await TagsController.getAll(req, res);
    } catch (error) {
        console.log(error);
    }
});

router.get('/allsearch', auth, async (req, res) => {
    try {
        await TagsController.getAllSearch(req, res);
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;