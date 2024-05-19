const InvalidTokensModel = require('../models/invalidTokensModel');
const BaseController = require('./baseController');

class InvalidTokensController extends BaseController {
    constructor() {
        super(InvalidTokensModel);
    }

    async addInvalidToken(accessToken, refreshToken) {
        try {
            const data = {
                "token": accessToken,
                "refresh_token": refreshToken
            };
            const invalidTokenId = await this.model.create(data);
            return true;
            } catch (error) {
            return false;
        }
    }

    async checkInvalidAccessToken(accessToken) {
        try {
            const item = await this.findOne("token", accessToken);
            if (item == null)
                return false;
            return true;
            } catch (error) {
            return false;
        }
    }

    async checkInvalidRefreshToken(refreshToken) {
        try {
            const item = await this.findOne("refresh_token", refreshToken);
            if (item == null)
                return false;
            return true;
            } catch (error) {
            return false;
        }
    }

}

module.exports = new InvalidTokensController();