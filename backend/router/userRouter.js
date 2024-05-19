const express = require('express');
const UserController = require('../controllers/userController');
const router = express.Router();
const auth = require('../middleware/auth');
const user = require('../middleware/user');

router.post('/register', user.createUserValidation, async (req, res) => {
    try {
        await UserController.createUser(req, res);
    } catch (error) {
        console.log(error);
    }
});

router.post('/login', user.loginValidation, async (req, res) => {
    try {
        await UserController.login(req, res);
    } catch (error) {
        console.log(error);
    }
});

router.post('/logout', auth, user.logoutValidation, async (req, res) => {
    try {
        await UserController.logout(req, res);
    } catch (error) {
        console.log(error);
    }
});

router.post('/refreshToken', async (req, res) => {
    try {
        await UserController.refreshToken(req, res);
    } catch (error) {
        console.log(error);
    }
});

router.post('/updateInfos', auth, user.updateInfosValidation, async (req, res) => {
    try {
        await UserController.updateInfos(req, res);
    } catch (error) {
        console.log(error);
    }
});

router.post('/updateLocation', auth, user.updateLocationValidation, async (req, res) => {
    try {
        await UserController.updateLocation(req, res);
    } catch (error) {
        console.log(error);
    }
});


router.post('/username', auth, user.getUserByUsernameValidation, async (req, res) => {
    try {
        await UserController.getUserByUsername(req, res);
    } catch (error) {
        console.log(error);
    }
});

router.post('/id', auth, user.postUserByIdValidation, async (req, res) => {
    try {
        await UserController.getUserById(req, res);
    } catch (error) {
        console.log(error);
    }
});

router.post('/delete', auth, user.deleteUser, async (req, res) => {
    try {
        await UserController.deleteUser(req, res);
    } catch (error) {
        console.log(error);
    }
});

router.post('/emailvalidation', user.emailValidation, async (req, res) => {
    try {
        await UserController.emailValidation(req, res);
    } catch (error) {
        console.log(error);
    }
});

router.post('/resetpasswordrequest', user.resetPasswordRequestValidation, async (req, res) => {
    try {
        await UserController.resetPasswordRequest(req, res);
    } catch (error) {
        console.log(error);
    }
});

router.post('/resetpasswordvalidation', user.resetPasswordValidation, async (req, res) => {
    try {
        await UserController.resetPasswordValidation(req, res);
    } catch (error) {
        console.log(error);
    }
});

router.get('/id', auth, user.getUserByIdValidation, async (req, res) => {
    try {
        await UserController.getPersonaleUser(req, res);
    } catch (error) {
        console.log(error);
    }
});

router.get('/interesting', auth, user.getInterestingUsersValidation, async (req, res) => {
    try {
        await UserController.getInterestingUsers(req, res);
    } catch (error) {
        console.log(error);
    }
});

router.get('/famerating/:id', auth, user.getFameRatingValidation, async (req, res) => {
    try {
        await UserController.getFameRating(req, res);
    } catch (error) {
        console.log(error);
    }
});

router.get('/cities', auth, user.getCities, async (req, res) => {
    try {
        await UserController.getCities(req, res);
    } catch (error) {
        console.log(error);
    }
});

router.post('/settingsUpdate', auth, user.settingsUpdateInfos, async (req, res) => {
    try {
        await UserController.settingsUpdateInfos(req, res);
    } catch (error) {
        console.log(error);
    }
});

router.get('/search/:age/:fameRating/:location/:tags', auth, user.getSearchResultUsers, async (req, res) => {
    try {
        await UserController.getSearchResultUsers(req, res);
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;