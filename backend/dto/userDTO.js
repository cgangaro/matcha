const { deleteUser } = require("../controllers/userController");
const baseValidator = require("./validators/baseValidator");

class UserDTO extends baseValidator {
    constructor() {
        super();
    }

    createUserVerification(username, email, password, first_name, last_name, age) {
        super.fieldIsRequired('username', username);
        super.fieldIsRequired('email', email);
        super.fieldIsRequired('password', password);
        super.fieldIsRequired('first_name', first_name);
        super.fieldIsRequired('last_name', last_name);
        super.fieldIsRequired('age', age);

        if (this.isValid()) {
            super.validateString('username', username, 3, 25, /^[a-zA-Z0-9._-]+$/);
            super.validateString('email', email, 5, 50, /^[0-9a-zA-Z@._-]+$/);
            super.validateString('password', password, 8, 25);
            super.validateString('first_name', first_name, 3, 25, /^[a-zA-Z- ]+$/);
            super.validateString('last_name', last_name, 3, 25, /^[a-zA-Z- ]+$/);
        }

        if (this.isValid()) {
            super.validateEmail('email', email);
            super.validatePassword('password', password);
            super.validatePositiveInteger('age', age);
            super.validateNumberMoreThan('age', age, 18);
        }
        return this.isValid();
    }

    login(username, password) {
        super.fieldIsRequired('username', username);
        super.fieldIsRequired('password', password);

        if (this.isValid()) {
            super.validateString('username', username, 3, 25, /^[a-zA-Z0-9._-]+$/);
            super.validateString('password', password, 8, 25);
        }

        if (this.isValid()) {
            super.validatePassword('password', password);
        }

        return this.isValid();
    }

    updateInfos(id, gender, sexual_preferences, biography, files, tags) {
        super.fieldIsRequired('id', id);
        super.validatePositiveInteger('id', id);
        if (gender === undefined && sexual_preferences === undefined && biography === undefined) {
            this.errors.push('No values to update');
        }

        if (this.isValid()) {
            if (gender !== undefined) {
                super.validateString('gender', gender, 1, 10, /^[0-9a-zA-Z+ -]+$/);
            }

            if (sexual_preferences !== undefined) {
                super.validateJson('sexual_preferences', sexual_preferences);
            }

            if (biography !== undefined) {
                super.validateString('biography', biography, 0, 400, /^[0-9a-zA-Z~`!@#$%^&*()+=_-{}[\]|:;"'><,.?/ ]+$/);
            }

            if (files.length < 0 || files.length > 5) {
                this.errors.push(`Incorrect image number`);
            }

            for (var i = 0; i < files.length; i++) {
                super.validateImageFile(files[i]);
            }

            for (var y = 0; y < tags.length; y++) {
                super.validateString('tag ' + tags[y], tags[y], 1, 20, /^#[0-9a-zA-Z+ ]+$/);
            }
        }
        return this.isValid();
    }

    updateLocation(id, latitude, longitude, city) {
        super.fieldIsRequired('id', id);
        super.validatePositiveInteger('id', id);
        super.fieldIsRequired('latitude', latitude);
        super.fieldIsRequired('longitude', longitude);
        super.fieldIsRequired('city', city);

        if (this.isValid()) {
            super.validateFloatLatitude('latitude', latitude);
            super.validateFloatLongitude('longitude', longitude);
            super.validateString('city', city, 0, 100, /^[0-9a-zA-Z~`!@#$%^&*()+=_-{}[\]|:;"'><,.?/ ]+$/);
        }
        return this.isValid();
    }

    emailValidation(token) {
        super.fieldIsRequired('token', token);

        return this.isValid();
    }

    resetPasswordRequest(email) {
        super.fieldIsRequired('email', email);

        if (this.isValid()) {
            super.validateString('email', email, 5, 50, /^[0-9a-zA-Z@._-]+$/);
        }

        if (this.isValid()) {
            super.validateEmail('email', email);
        }
        return this.isValid();
    }

    resetPasswordValidation(token, password) {
        super.fieldIsRequired('token', token);
        super.fieldIsRequired('password', password);

        if (this.isValid()) {
            super.validateString('password', password, 8, 25);
        }

        if (this.isValid()) {
            super.validatePassword('password', password);
        }
        return this.isValid();
    }

    getFameRating(id) {
        super.fieldIsRequired('id', id);
        super.validatePositiveInteger('id', id);

        return this.isValid();
    }

    getUserById(id) {
        super.fieldIsRequired('id', id);
        super.validatePositiveInteger('id', id);

        return this.isValid();
    }

    getUserByUsername(username) {
        super.fieldIsRequired('username', username);
        super.validateString('username', username, 3, 25, /^[a-zA-Z0-9._-]+$/);

        return this.isValid();
    }

    settingsUpdateInfos(id, username, first_name, last_name, email, password, gender, sexual_preferences, biography, latitude, longitude, city, location_permission, files, tags) {
        super.fieldIsRequired('id', id);
        super.validatePositiveInteger('id', id);

        if (username !== undefined && username !== null) {
            super.validateString('username', username, 3, 25, /^[a-zA-Z0-9_-]+$/);
        }
        if (first_name !== undefined && first_name !== null) {
            super.validateString('first_name', first_name, 3, 25, /^[a-zA-Z- ]+$/);
        }
        if (last_name !== undefined && last_name !== null) {
            super.validateString('last_name', last_name, 3, 25, /^[a-zA-Z- ]+$/);
        }
        if (gender !== undefined && gender !== null) {
            super.validateString('gender', gender, 1, 10, /^[0-9a-zA-Z+ ]+$/);
        }

        if (sexual_preferences !== undefined && sexual_preferences !== null) {

            super.validateNotEmptyArray('sexual_preferences', sexual_preferences);
            super.validateJson('sexual_preferences', sexual_preferences);
        }

        if (biography !== undefined && biography !== null) {
            super.validateString('biography', biography, 0, 400, /^[0-9a-zA-Z~`!@#$%^&*()+=_-{}[\]|:;"'><,.?/ ]+$/);
        }
        if (email !== undefined && email !== null) {
            super.validateEmail('email', email);
        }

        if (password !== undefined && password !== null) {
            super.validateString('password', password, 8, 25);
        }

        if (latitude !== undefined && latitude !== null && latitude > 0) {
            super.validateFloatLatitude('latitude', latitude);
        }

        if (longitude !== undefined && longitude !== null && longitude > 0) {
            super.validateFloatLongitude('longitude', longitude);
        }

        if (city !== undefined && city !== null) {
            super.validateString('city', city, 0, 100, /^[0-9a-zA-Z~`!@#$%^&*()+=_-{}[\]|:;"'><,.?/ ]+$/);
        }

        if (location_permission != undefined && location_permission != null) {
            super.validateBoolean('location_permission', location_permission);
        }

        if (files !== undefined && files !== null) {
            if (!Array.isArray(files)) {
                this.errors.push('Files must be an array');
            } else {
                if (files.length < 0 || files.length > 5) {
                    this.errors.push('Incorrect image number');
                }

                for (let i = 0; i < files.length; i++) {
                    super.validateImageFile(files[i]);
                }
            }
        }

        if (tags !== undefined && tags !== null) {
            if (!Array.isArray(tags)) {
                this.errors.push('Tags must be an array');
            } else {
                for (let y = 0; y < tags.length; y++) {
                    super.validateString('tag ' + tags[y], tags[y], 1, 20, /^[0-9a-zA-Z+ ]+$/);
                }
            }
        }

        return this.isValid();
    }

    deleteUser(id) {
        super.fieldIsRequired('id', id);
        super.validatePositiveInteger('id', id);

        return this.isValid();
    }

    getCities(id) {
        super.fieldIsRequired('id', id);
        super.validatePositiveInteger('id', id);

        return this.isValid();
    }

    getSearchResultUsersValidation(id, age, fameRating, location, tags) {
        super.fieldIsRequired('id', id);
        super.validatePositiveInteger('id', id);
        super.fieldIsRequired('age', age);
        super.fieldIsRequired('fameRating', fameRating);
        super.fieldIsRequired('location', location);
        super.fieldIsRequired('tags', tags);

        if (this.isValid()) {
            super.validateString('age', age, 1, 100, /^[0-9a-zA-Z~`\-!@#$%^&*()+=_-{}[\]|:;"',.?/ ]+$/);
            super.validateString('fameRating', fameRating, 1, 100, /^[0-9a-zA-Z~`\-!@#$%^&*()+=_-{}[\]|:;"',.?/ ]+$/);
            super.validateString('location', location, 1, 100, /^[0-9a-zA-Z~`\-!@#$%^&*()+=_-{}[\]|:;"',.?/ ]+$/);
            super.validateString('tags', tags, 1, 100, /^[0-9a-zA-Z~`\-!@#$%^&*()+=_-{}[\]|:;"',.?/ ]+$/);
        }

        return this.isValid();
    }
}

module.exports = UserDTO;