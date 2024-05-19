const BaseController = require('./baseController');
const InvalidTokensController = require('./invalidTokenController');
const UserModel = require('../models/userModel');
const MessagesModel = require('../models/messagesModel');
const BlocksModel = require('../models/blocksModel');
const LikesModel = require('../models/likesModel');
const ReportsModel = require('../models/reportsModel');
const TagsModel = require('../models/tagsModel');
const ViewsModel = require('../models/viewsModel');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid')
const fs = require('fs');
const decode = require('node-base64-image').decode;

const MAX_RADIUS_LOCATION_FILTER = 35;
const COMMON_TAGS_MINIMUM_FILTER = 1;
const FAME_RATING_RANGE_FILTER = 50;

var nodemailer = require('nodemailer');
const { update } = require('../models/invalidTokensModel');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

var mailOptions = {
    from: process.env.EMAIL,
    to: '',
    subject: '',
    text: ''
};

const ageGap = {
    _18_25: "18-25",
    _26_35: "26-35",
    _36_50: "36-50",
    _51: "+51"
}

const fameRatingGap = {
    _30: "-30",
    _31_60: "31-60",
    _61_100: "61-100",
    _101_150: "101-150",
    _151_250: "151-250",
    _251: "+251"
}

class UserController extends BaseController {
    constructor() {
        super(UserModel);
    }

    async createUser(req, res) {
        try {
            const userData = req.body;
            if (await this.model.findByUsername(userData.username) != null) {
                res.status(400).json({ error: 'Username already in use' });
                return;
            }
            if (await this.model.findByEmail(userData.email) != null) {
                res.status(400).json({ error: 'Email already in use' });
                return;
            }

            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const refreshToken = uuidv4();
            const emailVerificationToken = uuidv4();
            const data = {
                "username": userData.username,
                "email": userData.email,
                "password": hashedPassword,
                "password_reset": 0,
                "password_verification_token": "",
                "first_name": userData.first_name,
                "last_name": userData.last_name,
                "age": userData.age,
                "email_checked": 0,
                "email_verification_token": emailVerificationToken,
                "location_permission": 0,
                "token": refreshToken,
                "token_creation": this._getTimestampString(),
                "token_expiration": this._getTimestampString(1),
                "latitude": 0,
                "longitude": 0,
                "fame_rating": 0
            };
            const userId = await this.model.create(data);
            res.cookie('accessToken', this._generateToken(userId), { httpOnly: true, maxAge: 900000 });
            res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 86400000 });
            const returnData = {
                "id": userId,
                "username": userData.username,
                "email": userData.email,
                "first_name": userData.first_name,
                "last_name": userData.last_name,
                "age": userData.age,
                "email_checked": 0,
                "location_permission": false,
                "latitude": 0,
                "longitude": 0
            };
            mailOptions.to = userData.email;
            mailOptions.subject = "Email verification";
            mailOptions.text = "Hi " + userData.username + "\nClick on the following link to activate your account:\n" + process.env.FRONTEND_URL + "/verification/email/" + emailVerificationToken;
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                } else {
                }
            });
            res.status(201).json({ message: 'User created', user: returnData });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async login(req, res) {
        try {
            const { username, password } = req.body;
            const user = await UserModel.findByUsername(username);

            if (!user) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                res.status(401).json({ error: 'Invalid credentials (password)' });
                return;
            }

            if (!user.email_checked) {
                res.status(401).json({ error: 'Please check your email address' });
                return;
            }

            const accessToken = this._generateToken(user.id);
            const refreshToken = uuidv4();
            if (user.password_reset) {
                const dataToUpdate = {
                    "password_reset": 0,
                    "password_verification_token": "",
                    "token": refreshToken,
                    "token_creation": this._getTimestampString(),
                    "token_expiration": this._getTimestampString(1)
                };
                const userIdReturn = await this.model.update(user.id, dataToUpdate);
            } else {
                const dataToUpdate = {
                    "token": refreshToken,
                    "token_creation": this._getTimestampString(),
                    "token_expiration": this._getTimestampString(1)
                };
                const userIdReturn = await this.model.update(user.id, dataToUpdate);
            }
            const data = {
                "id": user.id,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "age": user.age,
                "email_checked": user.email_checked,
                "complete_register": user.complete_register,
                "gender": user.gender,
                "sexual_preferences": user.sexual_preferences,
                "biography": user.biography,
                "picture_1": user.picture_1,
                "picture_2": user.picture_2,
                "picture_3": user.picture_3,
                "picture_4": user.picture_4,
                "picture_5": user.picture_5,
                "tags": await TagsModel.getAllUserTags(user.id),
                "fame_rating": user.fame_rating,
                "location_permission": user.location_permission,
                "last_connection": user.last_connection,
                "created_at": user.created_at
            };
            res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 3600000 });
            res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 86400000 });
            res.status(200).json({ message: 'Login successful', user: data });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async logout(req, res) {
        try {
            const accessToken = this._parseCookie(req, 'accessToken');
            if (!accessToken) {
                res.status(401).json({ error: 'Access token missing' });
                return;
            }
            const refreshToken = this._parseCookie(req, 'refreshToken');
            if (!refreshToken) {
                res.status(401).json({ error: 'Refresh token missing' });
                return;
            }
            const invalidToken = await InvalidTokensController.addInvalidToken(accessToken, refreshToken);
            if (invalidToken) {
                res.clearCookie('accessToken');
                res.clearCookie('refreshToken');
                res.status(200).json({ message: 'Logout successful' });
            } else {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async refreshToken(req, res) {
        try {
            const refreshToken = this._parseCookie(req, 'refreshToken');
            if (!refreshToken) {
                res.status(401).json({ error: 'Missing refreshToken' });
                return;
            }
            if (!InvalidTokensController.checkInvalidRefreshToken(refreshToken)) {
                return res.status(403).send({ error: 'Invalid token blacklisted' });
            }
            const user = await this.model.findByToken(refreshToken);
            if (!user) {
                res.status(403).send({ error: 'Invalid refreshToken' });
                return;
            }

            const tokenExpiration = new Date(user.token_expiration);
            const now = new Date();
            if (tokenExpiration < now) {
                res.status(401).json({ error: 'refreshToken expired' });
                return;
            }

            const accessToken = this._generateToken(user.id);
            res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 900000 });
            res.status(200).json({ message: 'Access token refreshed' });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async updateInfos(req, res) {
        try {
            const userId = req.user.userId;
            const userData = req.body;
            var pictures = await this._savePictures(userData.files, userId);
            if (pictures == null) {
                res.status(400).json({ error: 'Invalid pictures files' });
                return;
            }
            if (pictures.length <= 0) {
                res.status(400).json({ error: 'Picture missing' });
                return;
            }
            const data = {
                "complete_register": true,
                "gender": userData.gender,
                "sexual_preferences": JSON.stringify(userData.sexual_preferences),
                "biography": userData.biography,
                "picture_1": pictures[0],
                "picture_2": pictures[1],
                "picture_3": pictures[2],
                "picture_4": pictures[3],
                "picture_5": pictures[4]
            };
            if (await this.checkById(userId)) {
                const userIdReturn = await this.model.update(userId, data);
                const userTags = userData.tags;
                const tagsReturn = await TagsModel.addUserTags(userTags, userId);
                const dataReturn = {
                    "complete_register": true,
                    "gender": userData.gender,
                    "sexual_preferences": JSON.stringify(userData.sexual_preferences),
                    "biography": userData.biography,
                    "picture_1": pictures[0],
                    "picture_2": pictures[1],
                    "picture_3": pictures[2],
                    "picture_4": pictures[3],
                    "picture_5": pictures[4],
                    "tags": userTags
                };
                res.status(200).json({ message: 'User updated', user: dataReturn });
            } else {
                res.status(400).json({ error: 'User id is incorrect' });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async updateLocation(req, res) {
        try {
            const userId = req.user.userId;
            const userData = req.body;
            const data = {
                "latitude": userData.latitude,
                "longitude": userData.longitude,
                "city": userData.city
            };
            if (await UserModel.checkLocationPermission(userId)) {
                res.status(400).json({ error: 'User location has been updated manually' });
                return;
            }
            if (await this.checkById(userId)) {
                const userIdReturn = await this.model.update(userId, data);
                res.status(200).json({ message: 'User updated', user: data });
            } else {
                res.status(400).json({ error: 'User id is incorrect' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async deleteUser(req, res) {
        try {
            const userId = req.user.userId;
            if (!await this.checkById(userId)) {
                res.status(400).json({ error: 'User id is incorrect' });
                return;
            }
            if (await MessagesModel.deleteUserMessages(userId) == null ||
                await BlocksModel.deleteUserBlocks(userId) == null ||
                await LikesModel.deleteUserLikes(userId) == null ||
                await ReportsModel.deleteUserReports(userId) == null ||
                await ViewsModel.deleteUserViews(userId) == null ||
                await TagsModel.deleteUserTags(userId) == null) {
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }
            this._removePicture("picture_1_" + userId);
            this._removePicture("picture_2_" + userId);
            this._removePicture("picture_3_" + userId);
            this._removePicture("picture_4_" + userId);
            this._removePicture("picture_5_" + userId);
            const userIdReturn = await this.model.delete(userId);
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            res.status(201).json({ message: 'User deleted', userIdReturn });
            return;

        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async emailValidation(req, res) {
        try {
            const validationEmailData = req.body;
            const user = await this.model.findByEmailVerificationToken(validationEmailData.token || "");
            if (user) {
                const data = {
                    "email_checked": 1,
                    "email_verification_token": "",
                };
                const userIdReturn = await this.model.update(user.id, data);
                res.status(200).json({ message: 'Email validated' });
            } else {
                res.status(400).json({ error: 'Incorrect token' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async resetPasswordRequest(req, res) {
        try {
            const resetPasswordData = req.body;
            const user = await this.model.findByEmail(resetPasswordData.email);
            if (user) {
                if (user.email_checked) {
                    const resetPasswordToken = uuidv4();
                    mailOptions.to = user.email;
                    mailOptions.subject = "Reset Password";
                    mailOptions.text = "Hi " + user.username + "\nClick on the following link to reset your password:\n" + "http://localhost:4200/verification/resetpassword/" + resetPasswordToken;
                    const sendMailReturn = await transporter.sendMail(mailOptions, async function (error, info) {
                        if (error) {
                            return false;
                        } else {
                            return true;
                        }
                    });
                    const data = {
                        "password_reset": 1,
                        "password_verification_token": resetPasswordToken,
                    };
                    const userIdReturn = await this.model.update(user.id, data);
                    res.status(200).json({ message: 'Reset password request sent' });
                }
                res.status(400).json({ error: 'Email was not checked' });
            } else {
                res.status(400).json({ error: 'User not found with this email' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async resetPasswordValidation(req, res) {
        try {
            const resetPasswordData = req.body;
            const user = await this.model.findByResetPasswordToken(resetPasswordData.token || "");
            if (user) {
                const hashedPassword = await bcrypt.hash(resetPasswordData.password, 10);
                const data = {
                    "password": hashedPassword,
                    "password_reset": 0,
                    "password_verification_token": "",
                };
                const userIdReturn = await this.model.update(user.id, data);
                res.status(200).json({ message: 'Password reset' });
            } else {
                res.status(400).json({ error: 'Incorrect token' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async _updateFameRating(value, userId) {
        try {
            const user = await this.model.findById(userId);
            const data = {
                "fame_rating": user.fame_rating + value,
            };
            const userIdReturn = await this.model.update(user.id, data);
        } catch (error) {
        }
    }

    async getPersonaleUser(req, res) {
        try {
            const user = await this.model.findById(req.user.userId);
            if (!user) {
                res.status(404).json({ error: 'User not found' })
                return;
            } else {
                const userReturn = {
                    "id": user.id || -1,
                    "username": user.username || '',
                    "first_name": user.first_name || '',
                    "last_name": user.last_name || '',
                    "age": user.age || '',
                    "gender": user.gender || '',
                    "sexual_preferences": user.sexual_preferences || '',
                    "email_checked": user.email_checked,
                    "complete_register": user.complete_register || false,
                    "biography": user.biography || ''
                }
                res.json({ user: userReturn });
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getUserById(req, res) {
        try {
            const user = await this.model.findById(req.body.id);
            if (!user) {
                res.status(404).json({ error: 'User not found' })
                return;
            } else {
                const tags = await TagsModel.getAllUserTags(user.id);
                const userReturn = {
                    "id": user.id || -1,
                    "username": user.username || '',
                    "first_name": user.first_name || '',
                    "last_name": user.last_name || '',
                    "age": user.age || '',
                    "gender": user.gender || '',
                    "sexual_preferences": user.sexual_preferences || '',
                    "complete_register": user.complete_register || false,
                    "biography": user.biography || '',
                    "picture_1": await this._getPictureDataFromPath(user.picture_1),
                    "picture_2": await this._getPictureDataFromPath(user.picture_2),
                    "picture_3": await this._getPictureDataFromPath(user.picture_3),
                    "picture_4": await this._getPictureDataFromPath(user.picture_4),
                    "picture_5": await this._getPictureDataFromPath(user.picture_5),
                    "tags": tags || [],
                    "fame_rating": user.fame_rating,
                    "you_blocked_he": await BlocksModel.check([req.user.userId, user.id]),
                    "he_blocked_you": await BlocksModel.check([user.id, req.user.userId]),
                    "you_reported_he": await ReportsModel.check([req.user.userId, user.id]),
                    "location_permission": user.location_permission,
                    "latitude": user.latitude,
                    "longitude": user.longitude,
                    "city": user.city
                }
                res.status(200).json({ user: userReturn });
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getUserByUsername(req, res) {
        try {
            const user = await this.model.findByUsername(req.body.username);
            if (!user) {
                res.status(404).json({ error: 'User not found' })
                return;
            } else {
                const tags = await TagsModel.getAllUserTags(user.id);
                const userReturn = {
                    "id": user.id || -1,
                    "username": user.username || '',
                    "first_name": user.first_name || '',
                    "last_name": user.last_name || '',
                    "age": user.age || '',
                    "gender": user.gender || '',
                    "sexual_preferences": user.sexual_preferences || '',
                    "complete_register": user.complete_register || false,
                    "biography": user.biography || '',
                    "picture_1": await this._getPictureDataFromPath(user.picture_1),
                    "picture_2": await this._getPictureDataFromPath(user.picture_2),
                    "picture_3": await this._getPictureDataFromPath(user.picture_3),
                    "picture_4": await this._getPictureDataFromPath(user.picture_4),
                    "picture_5": await this._getPictureDataFromPath(user.picture_5),
                    "tags": tags || [],
                    "fame_rating": user.fame_rating,
                    "you_blocked_he": await BlocksModel.check([req.user.userId, user.id]),
                    "he_blocked_you": await BlocksModel.check([user.id, req.user.userId]),
                    "you_reported_he": await ReportsModel.check([req.user.userId, user.id]),
                    "city": user.city
                }
                res.json(userReturn);
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getInterestingUsers(req, res) {
        try {
            const user = await this.model.findById(req.user.userId);
            const allUsers = await this.model.findAll();
            const usersList = this._firstFilterUsers(user, allUsers[0]);
            const newUserList = await this._secondFilterUsers(user, usersList);
            for (var i = 0; i < newUserList.length; i++) {
                const hasLiked = await LikesModel.check([req.user.userId, newUserList[i].id]);
                if (hasLiked) {
                    newUserList.splice(i, 1);
                    i--;
                } else {
                    const hasBlocked = await BlocksModel.checkRelation([req.user.userId, newUserList[i].id]);
                    if (hasBlocked) {
                        newUserList.splice(i, 1);
                        i--;
                    }
                }
            }
            // const usersListSimplified = this._usersListSimplified(newUserList);
            // const userListSimplifiedSuffled = this._shuffleArray(usersListSimplified);
            res.status(200).json({ users: newUserList });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async settingsUpdateInfos(req, res) {
        try {
            const userId = req.user.userId;
            const userData = req.body.user;
            const files = req.body.files;
            if (!userData || !files) {
                res.status(400).json({ error: 'Missing data' });
                return;
            }

            if (userData.username && await this.model.findByUsername(userData.username) != null) {
                res.status(400).json({ error: 'Username already in use' });
                return;
            }
            if (userData.email && await this.model.findByEmail(userData.email) != null) {
                res.status(400).json({ error: 'Email already in use' });
                return;
            }

            if (userData.sexual_preferences) {
                userData.sexual_preferences = JSON.stringify(userData.sexual_preferences);
            }

            var pictures = [];
            if (files.length > 0) {
                pictures = await this._savePictures(files, userId);
                for (var i = 0; i < pictures.length; i++) {
                    if (pictures[i] != null) {
                        userData["picture_" + (i + 1)] = pictures[i];
                    }
                }
                for (var i = pictures.length; i < 5; i++) {
                    userData["picture_" + (i + 1)] = null;
                }
            }

            let hasOtherFields = null;
            const newTags = userData.tags;
            if (newTags) {
                delete userData.tags;
                hasOtherFields = Object.keys(userData).length > 0;
                await TagsModel.deleteUserTags(userId);
                await TagsModel.addUserTags(newTags, userId);
                if (!hasOtherFields) {
                    return res.status(200).json({ message: 'User updated' });
                }
            }
            hasOtherFields = Object.keys(userData).length > 0;

            if (userData.password) {
                const hashedPassword = await bcrypt.hash(userData.password, 10);
                userData.password = hashedPassword;
            }
            if (hasOtherFields) {
                await this.model.update(userId, userData);
                return res.status(200).json({ message: 'User updated' });
            } else
                return res.status(400).json({ error: 'Missing data' });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }


    async getFameRating(req, res) {
        try {
            const user = await this.model.findById(req.params.id);
            const fameRating = user.fame_rating;
            res.status(200).json({ fame_rating: fameRating });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getCities(req, res) {
        try {
            const all = await this.model.findAll();
            const allUsers = all[0];
            var citiesReturn = [];
            for (var i = 0; i < allUsers.length; i++) {
                const city = allUsers[i].city;
                if (city && (citiesReturn.find((it) => it == city) == undefined || !citiesReturn.find((it) => it == city))) {
                    citiesReturn.push(city);
                }
            }
            res.status(200).json({ cities: citiesReturn });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getSearchResultUsers(req, res) {
        try {
            const userId = req.user.userId;
            const age = req.params.age;
            const fameRating = req.params.fameRating;
            const location = req.params.location;
            const tags = req.params.tags;
            const all = await this.model.findAll();
            var allUsers = all[0].filter(it => it.complete_register == true);
            allUsers = this._ageFilter(allUsers, age);
            allUsers = this._fameRatingFilter(allUsers, fameRating);
            allUsers = this._locationFilter(allUsers, location);
            allUsers = await this._tagFilter(allUsers, tags);
            const simplifiedUsers = await this._usersListSimplified(allUsers, userId);
            res.status(200).json({ users: simplifiedUsers });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    _ageFilter(users, ageFilter) {
        const filter = ageFilter.split(',');
        if (!filter || filter.length <= 0 || filter[0] == 'none')
            return users;
        var usersRet = [];
        for (var i = 0; i < users.length; i++) {
            for (var y = 0; y < filter.length; y++) {
                if (filter[y] == ageGap._18_25 && users[i].age >= 18 && users[i].age <= 25) {
                    usersRet.push(users[i]);
                    break;
                } else if (filter[y] == ageGap._26_35 && users[i].age >= 26 && users[i].age <= 35) {
                    usersRet.push(users[i]);
                    break;
                } else if (filter[y] == ageGap._36_50 && users[i].age >= 36 && users[i].age <= 50) {
                    usersRet.push(users[i]);
                    break;
                } else if (filter[y] == ageGap._51 && users[i].age >= 51) {
                    usersRet.push(users[i]);
                    break;
                }
            }
        }
        return usersRet;
    }

    _fameRatingFilter(users, fameRatingFilter) {
        const filter = fameRatingFilter.split(',');
        if (!filter || filter.length <= 0 || filter[0] == 'none')
            return users;
        var usersRet = [];
        for (var i = 0; i < users.length; i++) {
            for (var y = 0; y < filter.length; y++) {
                if (filter[y] == fameRatingGap._30 && users[i].fame_rating <= 30) {
                    usersRet.push(users[i]);
                    break;
                } else if (filter[y] == fameRatingGap._31_60 && users[i].fame_rating >= 31 && users[i].fame_rating <= 60) {
                    usersRet.push(users[i]);
                    break;
                } else if (filter[y] == fameRatingGap._61_100 && users[i].fame_rating >= 61 && users[i].fame_rating <= 100) {
                    usersRet.push(users[i]);
                    break;
                } else if (filter[y] == fameRatingGap._101_150 && users[i].fame_rating >= 101 && users[i].fame_rating <= 150) {
                    usersRet.push(users[i]);
                    break;
                } else if (filter[y] == fameRatingGap._151_250 && users[i].fame_rating >= 151 && users[i].fame_rating <= 250) {
                    usersRet.push(users[i]);
                    break;
                } else if (filter[y] == fameRatingGap._251 && users[i].fame_rating >= 251) {
                    usersRet.push(users[i]);
                    break;
                }
            }
        }
        return usersRet;
    }

    _locationFilter(users, locationFilter) {
        const filter = locationFilter.split(',');
        if (!filter || filter.length <= 0 || filter[0] == 'none')
            return users;
        var usersRet = [];
        for (var i = 0; i < users.length; i++) {
            for (var y = 0; y < filter.length; y++) {
                if (filter[y] == users[i].city) {
                    usersRet.push(users[i]);
                    break;
                }
            }
        }
        return usersRet;
    }

    async _tagFilter(users, tagFilter) {
        const filter = tagFilter.split(',');
        if (!filter || filter.length <= 0 || filter[0] == 'none')
            return users;
        const newFilter = [];
        for (var o = 0; o < filter.length; o++) {
            newFilter.push("#".concat(filter[o]));
        }
        var usersRet = [];
        for (var i = 0; i < users.length; i++) {
            const tags = await TagsModel.getAllUserTags(users[i].id);
            for (var y = 0; y < newFilter.length; y++) {
                if (tags.includes(newFilter[y])) {
                    usersRet.push({
                        id: users[i].id,
                        username: users[i].username,
                        age: users[i].age,
                        tags: tags,
                        latitude: users[i].latitude,
                        longitude: users[i].longitude,
                        fame_rating: users[i].fame_rating,
                        first_name: users[i].first_name,
                        last_name: users[i].last_name,
                        city: users[i].city
                    });
                    break;
                }
            }
        }
        return usersRet;
    }

    _firstFilterUsers(user, allUsers) {
        const genderFilter = allUsers.filter(it => user.sexual_preferences.includes(it.gender));
        const sexualPreferencesFilter = genderFilter.filter(it => it.sexual_preferences.includes(user.gender));
        const locationFilter = sexualPreferencesFilter.filter(it => {
            if (user.latitude > 0 && user.longitude > 0) {
                const isClose = this._isInsideRadius(user.latitude, user.longitude, it.latitude, it.longitude, MAX_RADIUS_LOCATION_FILTER);
                return isClose;
            } else {
                return true;
            }
        });
        const fameRatingFilter = locationFilter.filter(it => {
            return it.fame_rating <= (user.fame_rating + FAME_RATING_RANGE_FILTER) && it.fame_rating >= (user.fame_rating - FAME_RATING_RANGE_FILTER)
        });
        return fameRatingFilter;
    }

    async _secondFilterUsers(user, allUsers) {
        var newUserList = [];
        const userTags = await TagsModel.getAllUserTags(user.id);
        for (var i = 0; i < allUsers.length; i++) {
            const tags = await TagsModel.getAllUserTags(allUsers[i].id);
            const commonTags = this._nbCommonElements(userTags, tags);
            if (commonTags >= COMMON_TAGS_MINIMUM_FILTER) {
                if (user.id != allUsers[i].id) {
                    newUserList.push(
                        {
                            id: allUsers[i].id, username: allUsers[i].username,
                            age: allUsers[i].age, tags: tags,
                            latitude: allUsers[i].latitude, longitude: allUsers[i].longitude,
                            fame_rating: allUsers[i].fame_rating
                        }
                    );
                }
            }
        }
        return newUserList;
    }

    _nbCommonElements(array1, array2) {
        var count = 0;
        for (var i = 0; i < array1.length; i++) {
            for (var y = 0; y < array2.length; y++) {
                if (array1[i] == array2[y])
                    count++;
            }
        }
        return count;
    }

    async _usersListSimplified(usersList, userId) {
        var list = [];
        for (var i = 0; i < usersList.length; i++) {
            var tags = usersList[i].tags;
            if (!tags || tags == undefined) {
                tags = await TagsModel.getAllUserTags(usersList[i].id);
            }
            if (usersList[i].id != userId) {
                list.push({
                    id: usersList[i].id,
                    username: usersList[i].username,
                    age: usersList[i].age,
                    tags: tags,
                    latitude: usersList[i].latitude,
                    longitude: usersList[i].longitude,
                    first_name: usersList[i].first_name,
                    last_name: usersList[i].last_name,
                    city: usersList[i].city,
                    fame_rating: usersList[i].fame_rating
                })
            }
        }
        return list;
    }

    _shuffleArray(array) {
        let currentIndex = array.length;
        var randomIndex = 0;
        while (currentIndex > 0) {

            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }

        return array;
    }

    _isInsideRadius(originalLatitude, originalLongitude, newLatitude, newLongitude, radiusInKm) {
        const earthRadiusInKm = 6371;
        const differenceLatitude = this._toRadians(newLatitude - originalLatitude);
        const differenceLongitude = this._toRadians(newLongitude - originalLongitude);
        const a =
            Math.sin(differenceLatitude / 2) * Math.sin(differenceLatitude / 2) +
            Math.cos(this._toRadians(originalLatitude)) * Math.cos(this._toRadians(newLatitude)) *
            Math.sin(differenceLongitude / 2) * Math.sin(differenceLongitude / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distance = earthRadiusInKm * c;

        return distance <= radiusInKm;
    }

    _toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    _generateToken(userId) {
        const secretKey = process.env.JWT_SECRET;
        const expiresInMinutes = Number(process.env.JWT_EXPIRES_IN);

        if (!secretKey || !expiresInMinutes) {
            throw new Error('JWT configuration error');
        }

        const currentTimeInSeconds = Math.floor(Date.now() / 1000);
        const expirationTimeInSeconds = currentTimeInSeconds + expiresInMinutes * 60;

        const payload = {
            userId: userId,
            iat: currentTimeInSeconds,
            exp: expirationTimeInSeconds
        };
        const token = jwt.sign(payload, secretKey);

        return token;
    }

    _parseCookie(req, toFind) {
        const cookies = req.headers.cookie;
        if (cookies) {
            const cookieArray = cookies.split(';');
            for (let i = 0; i < cookieArray.length; i++) {
                const cookie = cookieArray[i].split('=');
                if (cookie[0].trim() === toFind) {
                    return cookie[1];
                }
            }
        }
        return null;
    }

    async _savePictures(files, userId) {
        var picturesPath = [];
        const maxFiles = (files.length < 5) ? files.length : 5;
        for (var i = 0; i < 5; i++) {
            if (i < files.length) {
                var file = files[i];
                var type = "";
                if (file.substring(0, 22) == 'data:image/png;base64,') {
                    file = file.replace("data:image/png;base64,", "");
                    type = "png";
                } else if (file.substring(0, 23) == 'data:image/jpeg;base64,') {
                    file = file.replace("data:image/jpeg;base64,", "");
                    type = "jpeg";
                } else if (file.substring(0, 22) == 'data:image/jpg;base64,') {
                    file = file.replace("data:image/jpg;base64,", "");
                    type = "jpg";
                } else {
                    return null;
                }
                const path = "/app/imagesSaved/picture_" + (i + 1) + "_" + userId;
                try {
                    decode(file, { fname: path, ext: type });
                    if (type != "png") {
                        fs.unlink(path + ".png", (error) => {
                            if (error) {
                                return null;
                            } else {
                                return true;
                            }
                        });
                    }
                    if (type != "jpeg") {
                        fs.unlink(path + ".jpeg", (error) => {
                            if (error) {
                                return null;
                            } else {
                                return true;
                            }
                        });
                    }
                    if (type != "jpg") {
                        fs.unlink(path + ".jpg", (error) => {
                            if (error) {
                                return null;
                            } else {
                                return true;
                            }
                        });
                    }
                } catch (error) {
                    return null;
                }
                picturesPath.push((path + "." + type));
            } else {
                this._removePicture("picture_" + (i + 1) + "_" + userId);
            }
        }
        return picturesPath;
    }

    async _removePicture(filename) {
        fs.readdir("/app/imagesSaved/", (error, files) => {
            if (error) {
                return null;
            }
            const fileToRemove = files.find((file) =>
                file.startsWith(filename)
            );
            if (fileToRemove && fileToRemove.length > 0) {
                const pathToRemove = "/app/imagesSaved/" + fileToRemove;
                fs.unlink(pathToRemove, (error) => {
                    if (error) {
                        return null;
                    } else {
                        return true;
                    }
                });
            }
        });
    }

    async _getPictureDataFromPath(path) {
        if (!path || path.length <= 0) {
            return "";
        }
        return new Promise((resolve, reject) => {
            fs.readFile(path, (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    const imageString = data.toString('base64');
                    resolve(imageString);
                }
            });
        });
    }
}

module.exports = new UserController();