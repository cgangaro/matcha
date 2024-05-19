const connection = require('./database');
const fs = require('fs');
const initUsers = require('./initUsers');
const initTags = require('./initTags');

const createTableIfNotExists = async (tableName, sql) => {
    try {
        const [rows] = await connection.execute(`SHOW TABLES LIKE "${tableName}"`);

        if (rows.length === 1) {
            console.log(`Table "${tableName}" already exists`);
            return;
        }

        await connection.execute(sql);

        console.log(`Table "${tableName}" has been created`);

        if (tableName === 'users') {
            await initUsers.insertInitialUsers();
        } else if (tableName === 'tags') {
            await initTags.insertInitialTags();
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
};


const createUsersTable = async () => {
    const sql = `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        username VARCHAR(255) NOT NULL, 
        email VARCHAR(255) NOT NULL, 
        password VARCHAR(255) NOT NULL, 
        password_reset BOOLEAN NOT NULL,
        password_verification_token VARCHAR(255),
        first_name VARCHAR(255) NOT NULL, 
        last_name VARCHAR(255) NOT NULL, 
        age INT NOT NULL, 
        token VARCHAR(255),
        token_creation TIMESTAMP,
        token_expiration TIMESTAMP,
        email_checked BOOLEAN NOT NULL,
        email_verification_token VARCHAR(255),
        complete_register BOOLEAN DEFAULT FALSE,
        gender VARCHAR(255), 
        sexual_preferences JSON, 
        biography VARCHAR(512), 
        picture_1 VARCHAR(255), 
        picture_2 VARCHAR(255), 
        picture_3 VARCHAR(255), 
        picture_4 VARCHAR(255), 
        picture_5 VARCHAR(255), 
        fame_rating INT, 
        location_permission boolean NOT NULL,
        latitude FLOAT,
        longitude FLOAT,
        city VARCHAR(255),
        last_connection TIMESTAMP, 
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`;

    await createTableIfNotExists('users', sql);
}// VARCHAR(512) max length 4096 char
//TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP to see if it works

const createTagsTable = async () => {
    const sql = `CREATE TABLE IF NOT EXISTS tags (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        owner_id INT NOT NULL,
        FOREIGN KEY (owner_id) REFERENCES users(id)
    )`;

    await createTableIfNotExists('tags', sql);
}

const createViewsTable = async () => {
    const sql = `CREATE TABLE IF NOT EXISTS views (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        author_id INT NOT NULL, 
        recipient_id INT NOT NULL, 
        FOREIGN KEY (author_id) REFERENCES users(id), 
        FOREIGN KEY (recipient_id) REFERENCES users(id)
    )`;

    await createTableIfNotExists('views', sql);
}

const createLikesTable = async () => {
    const sql = `CREATE TABLE IF NOT EXISTS likes (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        author_id INT NOT NULL, 
        recipient_id INT NOT NULL, 
        FOREIGN KEY (author_id) REFERENCES users(id), 
        FOREIGN KEY (recipient_id) REFERENCES users(id)
    )`;

    await createTableIfNotExists('likes', sql);
}

const createReportsTable = async () => {
    const sql = `CREATE TABLE IF NOT EXISTS reports (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        author_id INT NOT NULL, 
        recipient_id INT NOT NULL, 
        FOREIGN KEY (author_id) REFERENCES users(id), 
        FOREIGN KEY (recipient_id) REFERENCES users(id)
    )`;

    await createTableIfNotExists('reports', sql);
}

const createBlocksTable = async () => {
    const sql = `CREATE TABLE IF NOT EXISTS blocks (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        author_id INT NOT NULL, 
        recipient_id INT NOT NULL, 
        FOREIGN KEY (author_id) REFERENCES users(id), 
        FOREIGN KEY (recipient_id) REFERENCES users(id)
    )`;

    await createTableIfNotExists('blocks', sql);
}

const createMessagesTable = async () => {
    const sql = `CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        author_id INT NOT NULL, 
        recipient_id INT NOT NULL, 
        message VARCHAR(255) NOT NULL, 
        date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
        FOREIGN KEY (author_id) REFERENCES users(id), 
        FOREIGN KEY (recipient_id) REFERENCES users(id)
    )`;

    await createTableIfNotExists('messages', sql);
}

const createInvalidTokenTable = async () => {
    const sql = `CREATE TABLE IF NOT EXISTS invalidTokens (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        token VARCHAR(255),
        refresh_token VARCHAR(255)
    )`;

    await createTableIfNotExists('invalidTokens', sql);
}

const runMigrations = async () => {
    const migrationsLockFile = './config/database/migrations.lock';
    if (!fs.existsSync(migrationsLockFile)) {
        try {
            fs.writeFileSync(migrationsLockFile, '');

            await createUsersTable();
            await createTagsTable();
            await createViewsTable();
            await createLikesTable();
            await createReportsTable();
            await createBlocksTable();
            await createMessagesTable();
            await createInvalidTokenTable();

            fs.appendFileSync(migrationsLockFile, 'createUsersTable\n');
            fs.appendFileSync(migrationsLockFile, 'createTagsTable\n');
            fs.appendFileSync(migrationsLockFile, 'createViewsTable\n');
            fs.appendFileSync(migrationsLockFile, 'createLikesTable\n');
            fs.appendFileSync(migrationsLockFile, 'createReportsTable\n');
            fs.appendFileSync(migrationsLockFile, 'createBlocksTable\n');
            fs.appendFileSync(migrationsLockFile, 'createMessagesTable\n');
            fs.appendFileSync(migrationsLockFile, 'createInvalidTokensTable\n');

        } catch (error) {
            console.error('Error running migrations:', error);
        }
    }
}

module.exports = {
    runMigrations
};