class BaseValidator {
    constructor() {
        this.errors = [];
    }

    fieldIsRequired(propName, value) {
        if (value === undefined || value === null || value === '') {
            this.errors.push(`${propName} is required.`);
        }
    }

    validateString(propName, value, minLength, maxLength, regex) {
        if (typeof value !== 'string') {
            this.errors.push(`${propName} must be a string.`);
        } else if (minLength !== undefined && value.length < minLength) {
            this.errors.push(`${propName} must be at least ${minLength} characters.`);
        } else if (maxLength !== undefined && value.length > maxLength) {
            this.errors.push(`${propName} cannot exceed ${maxLength} characters.`);
        } else if (regex !== undefined && !value.match(regex)) {
            this.errors.push(`${propName} must match ${regex}.`);
        }
    }

    validatePositiveInteger(propName, value) {
        if (typeof value === 'string' && /^\d+$/.test(value) || typeof value === 'number') {
            if (typeof value === 'string')
                value = parseInt(value);
            if (!Number.isInteger(value)) {
                this.errors.push(`${propName} must be a valid positive integer.`);
            } else if (value < 0 || value > Number.MAX_SAFE_INTEGER) {
                this.errors.push(`${propName} must be within a valid range.`);
            }
        } else {
            this.errors.push(`${propName} must be a valid positive integer.`);
        }
    }

    validateFloatLatitude(propName, value) {
        if (typeof value === 'string' && /^\d+$/.test(value) || typeof value === 'number') {
            value = parseFloat(value);
            if (value < -90.0 || value > 90.0) {
                this.errors.push(`${propName} must be within a valid range.`);
            }
        } else {
            this.errors.push(`${propName} must be a valid float.`);
        }
    }

    validateFloatLongitude(propName, value) {
        if (typeof value === 'string' && /^\d+$/.test(value) || typeof value === 'number') {
            value = parseFloat(value);
            if (value < -180.0 || value > 180.0) {
                this.errors.push(`${propName} must be within a valid range.`);
            }
        } else {
            this.errors.push(`${propName} must be a valid float.`);
        }
    }

    validateJson(propName, value) {
        if (typeof value !== 'object') {
            this.errors.push(`${propName} must be a valid JSON.`);
        }
    }

    validateNotEmptyArray(propName, value) {
        if (!Array.isArray(value) || value.length === 0) {
            this.errors.push(`${propName} must be a non-empty array.`);
        }
    }

    validateImageFile(file) {
        if (file.substring(0, 23) != 'data:image\/jpeg;base64,' && file.substring(0, 22) != 'data:image\/jpg;base64,' && file.substring(0, 22) != 'data:image\/png;base64,') {
            this.errors.push(`Invalid image`);
        }
    }

    validateEmail(propName, value) {
        if (typeof value !== 'string' || !value.match(/^\S+@\S+\.\S+$/)) {
            this.errors.push(`Email must be a valid email address.`);
        }
    }

    validatePassword(propName, value) {
        if (typeof value !== 'string' || !value.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/)) {
            this.errors.push(`Password must be a valid. Containing at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character.`);
        }
    }

    validateDate(propName, value) {
        if (typeof value !== 'string' || !value.match(/^\d{4}-\d{2}-\d{2}$/)) {
            this.errors.push(`${propName} must be a valid date.`);
        }
    }

    validateBoolean(propName, value) {
        if (typeof value !== 'boolean') {
            this.errors.push(`${propName} must be a boolean.`);
        } x
    }

    validateArray(propName, value) {
        if (!Array.isArray(value)) {
            this.errors.push(`${propName} must be an array.`);
        }
    }

    validateStringArray(propName, value, minLength, maxLength, regex) {
        for (var i = 0; i < value.length; i++) {
            this.validateString(propName + i, value[i], minLength, maxLength, regex);
        }
    }

    validateObject(propName, value) {
        if (typeof value !== 'object') {
            this.errors.push(`${propName} must be an object.`);
        }
    }

    validateNumber(propName, value) {
        if (typeof value !== 'number') {
            this.errors.push(`${propName} must be a number.`);
        }
    }

    validateNumberLessThan(propName, value, valueMax) {
        if (typeof value !== 'number' || value > valueMax) {
            this.errors.push(`${propName} should be less than ${valueMax}.`);
        }
    }

    validateNumberMoreThan(propName, value, valueMin) {
        if (typeof value !== 'number' || value < valueMin) {
            this.errors.push(`${propName} should be more than ${valueMin}.`);
        }
    }

    validatePositiveNumber(propName, value) {
        if (typeof value !== 'number' || value < 0) {
            this.errors.push(`${propName} must be a positive number.`);
        }
    }

    validatePositiveNumberOrZero(propName, value) {
        if (typeof value !== 'number' || value < 0) {
            this.errors.push(`${propName} must be a positive number or zero.`);
        }
    }

    isValid() {
        return this.errors.length === 0;
    }

    getValidationErrors() {
        const errorJSON = {};
        this.errors.forEach(error => {
            errorJSON["error"] = error;
        });
        return errorJSON;
    }
}

module.exports = BaseValidator;