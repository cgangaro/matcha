const pool = require('../config/database/database');

// Base model for all models
class BaseModel {
    constructor() {
        this.pool = pool;
    }

    async _query(sql, values) {
        const conn = await this.pool.getConnection();
        try {
            const rows = await conn.query(sql, values);
            return rows;
        } catch (error) {
            throw error;
        } finally {
            conn.release();
        }
    }

    async findOne(condition, values) {
        const sql = `SELECT * FROM ${this.tableName} WHERE ${condition} = ?`;
        const rows = await this._query(sql, values);
        if (rows.find((row) => row).length <= 0) {
            return null;
        }
        return rows[0][0];
    }

    async findMultiple(conditions, values) {
        if (conditions.length <= 0)
            return null;
        var sql = `SELECT * FROM ${this.tableName} WHERE`;
        for (var i = 0; i < (conditions.length - 1); i++) {
            sql = sql.concat(` ` + conditions[i] + ` = ? AND`);
        }
        sql = sql.concat(` ` + conditions[(conditions.length - 1)] + ` = ?`);
        const rows = await this._query(sql, values);
        if (rows.find((row) => row).length <= 0) {
            return null;
        }
        return rows;
    }

    async findMultipleOr(conditions, values) {
        if (conditions.length <= 0)
            return null;
        var sql = `SELECT * FROM ${this.tableName} WHERE`;
        for (var i = 0; i < (conditions.length - 1); i++) {
            sql = sql.concat(` ` + conditions[i] + ` = ? OR`);
        }
        sql = sql.concat(` ` + conditions[(conditions.length - 1)] + ` = ?`);
        const rows = await this._query(sql, values);
        if (rows.find((row) => row).length <= 0) {
            return null;
        }
        return rows;
    }

    async deleteMultipleOrConditions(conditions, values) {
        if (conditions.length <= 0)
            return null;
        var sql = `DELETE FROM ${this.tableName} WHERE`;
        for (var i = 0; i < (conditions.length - 1); i++) {
            sql = sql.concat(` ` + conditions[i] + ` = ? OR`);
        }
        sql = sql.concat(` ` + conditions[(conditions.length - 1)] + ` = ?`);
        const rows = await this._query(sql, values);
        if (!rows || !rows[0] == undefined || rows[0].affectedRows == undefined) {
            return null;
        }
        return rows[0].affectedRows;
    }

    async deleteMultipleAndConditions(conditions, values) {
        if (conditions.length <= 0)
            return null;
        var sql = `DELETE FROM ${this.tableName} WHERE`;
        for (var i = 0; i < (conditions.length - 1); i++) {
            sql = sql.concat(` ` + conditions[i] + ` = ? And`);
        }
        sql = sql.concat(` ` + conditions[(conditions.length - 1)] + ` = ?`);
        const rows = await this._query(sql, values);
        if (!rows || !rows[0] == undefined || rows[0].affectedRows == undefined) {
            return null;
        }
        return rows[0].affectedRows;
    }

    async findById(id) {
        return await this.findOne('id', [id]);
    }

    async findAll() {
        const sql = `SELECT * FROM ${this.tableName}`;
        return this._query(sql);
    }

    async create(data) {
        const sql = `INSERT INTO ${this.tableName} SET ?`;
        const result = await this._query(sql, data);
        return result[0].insertId;
    }

    async update(id, data) {
        const sql = `UPDATE ${this.tableName} SET ? WHERE id = ?`;
        const result = await this._query(sql, [data, id]);
        return result.insertId;
    }

    async delete(id) {
        const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
        const result = await this._query(sql, [id]);
        return result[0].affectedRows;
    }

    // Add more common model methods here like update, delete...
}

module.exports = BaseModel;
