const connection = require('./database');
const tagsForInit = require('./tagsForInit');

const insertInitialTags = async () => {
    const tags = tagsForInit.tagsInit();
    for (var i = 0; i < tags.length; i++) {
        const sql = `
            INSERT INTO tags (name, owner_id)
            VALUES (?, ?);
        `;

        const values = [
            tags[i].name,
            tags[i].owner_id
        ];

        connection.query(sql, values, (err, result) => {
            if (err) throw err;
        });
    }
}

module.exports = {
    insertInitialTags
};
