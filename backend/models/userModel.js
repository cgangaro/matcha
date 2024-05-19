const BaseModel = require('./baseModel');

class UserModel extends BaseModel {
    constructor() {
        super();
        this.tableName = 'users';
    }

    async findByUsername(username) {
        const user = await super.findOne('username', username);
        return user;
    }

    async findByEmail(email) {
        const user = await super.findOne('email', email);
        return user;
    }

    async findByEmailToken(token) {
        const user = await super.findOne('token', token);
        return user;
    }

    async findByResetPasswordToken(token) {
        const user = await super.findOne('password_verification_token', token);
        return user;
    }

    async findByEmailVerificationToken(token) {
        const user = await super.findOne('email_verification_token', token);
        return user;
    }

    async findByToken(token) {
        const user = await super.findOne('token', token);
        return user;
    }

    async checkLocationPermission(userId) {
        const user = await super.findOne('id', userId);
        return user.location_permission;
    }
    // Add more model-specific methods here,like update, delete...
}
module.exports = new UserModel();