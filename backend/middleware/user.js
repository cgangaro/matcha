const UserDTO = require("../dto/userDTO");

createUserValidation = (req, res, next) => {
    try {
        const { username, email, password, first_name, last_name, age } = req.body;
        const userDTO = new UserDTO();
        const isValid = userDTO.createUserVerification(username, email, password, first_name, last_name, age);
        if (!isValid) {
            return res.status(400).json(userDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
};

loginValidation = (req, res, next) => {
    try {
        const { username, password } = req.body;
        const userDTO = new UserDTO();
        const isValid = userDTO.login(username, password);
        if (!isValid) {
            return res.status(400).json(userDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
};

//add last connection
logoutValidation = (req, res, next) => {
    try {
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
};

updateInfosValidation = (req, res, next) => {
    try {
        const id = req.user.userId;
        const { gender, sexual_preferences, biography, files, tags } = req.body;
        const userDTO = new UserDTO();
        const isValid = userDTO.updateInfos(id, gender, sexual_preferences, biography, files, tags);
        if (!isValid) {
            return res.status(400).json(userDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
};

updateLocationValidation = (req, res, next) => {
    try {
        const id = req.user.userId;
        const { latitude, longitude, city } = req.body;
        const userDTO = new UserDTO();
        const isValid = userDTO.updateLocation(id, latitude, longitude, city);
        if (!isValid) {
            return res.status(400).json(userDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
};

getUserByIdValidation = (req, res, next) => {
    try {
        const id = req.user.userId;
        const userDTO = new UserDTO();
        const isValid = userDTO.getUserById(id);
        if (!isValid) {
            return res.status(400).json(userDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
};

postUserByIdValidation = (req, res, next) => {
    try {
        const id = req.body.id;
        const userDTO = new UserDTO();
        const isValid = userDTO.getUserById(id);
        if (!isValid) {
            return res.status(400).json(userDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
};

emailValidation = (req, res, next) => {
    try {
        const token = req.body.token
        const userDTO = new UserDTO();
        const isValid = userDTO.emailValidation(token);
        if (!isValid) {
            return res.status(400).json(userDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
};

resetPasswordRequestValidation = (req, res, next) => {
    try {
        const email = req.body.email
        const userDTO = new UserDTO();
        const isValid = userDTO.resetPasswordRequest(email);
        if (!isValid) {
            return res.status(400).json(userDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
};

resetPasswordValidation = (req, res, next) => {
    try {
        const token = req.body.token
        const password = req.body.password
        const userDTO = new UserDTO();
        const isValid = userDTO.resetPasswordValidation(token, password);
        if (!isValid) {
            return res.status(400).json(userDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
};

getUserByUsernameValidation = (req, res, next) => {
    try {
        const username = req.body.username;
        const userDTO = new UserDTO();
        const isValid = userDTO.getUserByUsername(username);
        if (!isValid) {
            return res.status(400).json(userDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
};

getInterestingUsersValidation = (req, res, next) => {
    try {
        const userId = req.user.userId;
        const userDTO = new UserDTO();
        const isValid = userDTO.getUserById(userId);
        if (!isValid) {
            return res.status(400).json(userDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
};

settingsUpdateInfos = (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { username, first_name, last_name, gender, sexual_preferences, biography, tags, latitude, longitude, city, location_permission } = req.body;
        const files = req.files;
        const userDTO = new UserDTO();
        const isValid = userDTO.settingsUpdateInfos(userId, username, first_name, last_name, gender, sexual_preferences, biography, latitude, longitude, city, location_permission, files, tags);
        if (!isValid) {
            return res.status(400).json(userDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
}

deleteUser = (req, res, next) => {
    try {
        const userId = req.user.userId;
        const userDTO = new UserDTO();
        const isValid = userDTO.deleteUser(userId);
        if (!isValid) {
            return res.status(400).json(userDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
}

getFameRatingValidation = (req, res, next) => {
    try {
        const userId = req.params.id;
        const userDTO = new UserDTO();
        const isValid = userDTO.getFameRating(userId);
        if (!isValid) {
            return res.status(400).json(userDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
};

getCities = (req, res, next) => {
    try {
        const userId = req.user.userId;
        const userDTO = new UserDTO();
        const isValid = userDTO.getCities(userId);
        if (!isValid) {
            return res.status(400).json(userDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
};

getSearchResultUsers = (req, res, next) => {
    try {
        const userId = req.user.userId;
        const age = req.params.age;
        const fameRating = req.params.fameRating;
        const location = req.params.location;
        const tags = req.params.tags;
        const userDTO = new UserDTO();
        const isValid = userDTO.getSearchResultUsersValidation(userId, age, fameRating, location, tags);
        if (!isValid) {
            return res.status(400).json(userDTO.getValidationErrors());
        }
        next();
    } catch (error) {
        res.status(400).send("Invalid parameters");
    }
};

module.exports = {
    createUserValidation,
    loginValidation,
    logoutValidation,
    updateInfosValidation,
    updateLocationValidation,
    getUserByIdValidation,
    postUserByIdValidation,
    emailValidation,
    resetPasswordRequestValidation,
    resetPasswordValidation,
    getUserByUsernameValidation,
    getInterestingUsersValidation,
    settingsUpdateInfos,
    deleteUser,
    getFameRatingValidation,
    getCities,
    getSearchResultUsers
};