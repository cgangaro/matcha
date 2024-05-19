// Base controller for all controllers
class BaseController {
    constructor(model) {
        this.model = model;
    }

    async getAll(req, res) {
        try {
            const items = await this.model.findAll();
            res.json(items);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getById(req, res) {
        try {
            const itemId = req.params.id;
            const item = await this.model.findById(itemId);
            if (!item) {
                return res.status(404).json({ error: 'Item not found' });
            }
            res.json(item);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async checkById(id) {
        const item = await this.model.findById(id);
        if (!item) {
            return false;
        } else {
            return true;
        }
    }

    _checkString(input, name, length_max, regex) {
        if (input.length <= 0)
            return name + ' is empty';
        if (input.length > length_max)
            return name + ' is too long';
        if (!regex.test(input))
            return name + ' contains prohibited characters';
        if (typeof input != "string")
            return name + ' invalid type';
        return true;
    }

    _checkPositiveInteger(input) {
        if (typeof input == "number" && Number.isInteger(input) && input < 2147483648) {
            return input;
        } else if (typeof input == "string" && input.match(/^[0-9]+$/) && Number.isInteger(parseInt(input)) && parseInt(input) < 2147483648) {
            return parseInt(input);
        } else {
            return -1;
        }
    }

    _getTimestampString(nextDays = 0) {
        const date = new Date();

        date.setDate(date.getDate() + nextDays);
        const time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        const dateString = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + time;

        return dateString;
    }
}

module.exports = BaseController;
