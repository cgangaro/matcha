const express = require('express');
const BlocksController = require('../controllers/blocksController');
const router = express.Router();
const auth = require('../middleware/auth');
const block = require('../middleware/block');

router.get('/user/:id', auth, block.getAllByAuthorId, async (req, res) => {
    try {
        await BlocksController.getAllByAuthorId(req, res);
    } catch (error) {
        console.log(error);
    }
});

router.get('/:id', auth, block.getBlockById, async (req, res) => {
    try {
        await BlocksController.getBlockById(req, res);
    } catch (error) {
        console.log(error);
    }
});

router.get('/:authorId/:recipientId', auth, block.getCheckBlock, async (req, res) => {
    try {
        await BlocksController.getCheckBlock(req, res);
    } catch (error) {
        console.log(error);
    }
});

router.post('/create', auth, block.createBlock, async (req, res) => {
    try {
        await BlocksController.createBlock(req, res);
    } catch (error) {
        console.log(error);
    }
});

router.post('/delete', auth, block.deleteBlock, async (req, res) => {
    try {
        await BlocksController.deleteBlock(req, res);
    } catch (error) {
        console.log(error);
    }
});

router.post('/delete/users', auth, block.deleteBlockByUsersId, async (req, res) => {
    try {
        await BlocksController.deleteBlockByUsersId(req, res);
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;