const connection = require('./database');
const usersForInit = require('./usersForInit');

const insertInitialUsers = async () => {

    const users = usersForInit.generateRandomUsersForInit();
    users.forEach(user => {
         const sql = `
            INSERT INTO users (username, email, password, password_reset, first_name, last_name, age, token, token_creation, token_expiration,
                email_checked, complete_register, gender, sexual_preferences, biography, picture_1, picture_2, picture_3, picture_4, picture_5,
                fame_rating, location_permission, latitude, longitude, city, last_connection)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;

        const values = [
            user.username,
            user.email,
            user.password,
            false,
            user.first_name,
            user.last_name,
            user.age,
            user.token,
            user.token_creation,
            user.token_expiration,
            user.email_checked,
            user.complete_register,
            user.gender,
            user.sexual_preferences,
            user.biography,
            user.picture_1,
            user.picture_2,
            user.picture_3,
            user.picture_4,
            user.picture_5,
            user.fame_rating,
            user.location_permission,
            user.latitude,
            user.longitude,
            user.city,
            null
        ];

        connection.query(sql, values, (err, result) => {
            if (err) throw err;
            console.log(`User "${user.username}" was inserted into the database`);
        });
    });
}

module.exports = {
    insertInitialUsers
};
