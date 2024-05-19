

const { faker } = require('@faker-js/faker');

function generateRandomUsersForInit() {
    const randomUsersForInit = [];

    const pictures = [
        "/app/imagesSaved/picture_1_1.jpeg",
        "/app/imagesSaved/picture_2_1.jpeg",
        "/app/imagesSaved/picture_3_1.jpeg",
        "/app/imagesSaved/picture_4_1.jpeg",
        "/app/imagesSaved/picture_5_1.jpeg",
        "/app/imagesSaved/picture_6_1.jpeg",
        "/app/imagesSaved/picture_7_1.jpeg",
        "/app/imagesSaved/picture_8_1.jpeg",
        "/app/imagesSaved/picture_9_1.jpeg",
        "/app/imagesSaved/picture_10_1.jpeg",
        "/app/imagesSaved/picture_11_1.jpeg",
        "/app/imagesSaved/picture_12_1.jpeg",
        "/app/imagesSaved/picture_13_1.jpeg",
        "/app/imagesSaved/picture_14_1.jpeg",
        "/app/imagesSaved/picture_15_1.jpeg",
        "/app/imagesSaved/picture_16_1.jpeg",
        "/app/imagesSaved/picture_17_1.jpeg",
        "/app/imagesSaved/picture_18_1.jpeg",
        "/app/imagesSaved/picture_19_1.jpeg",
        "/app/imagesSaved/picture_20_1.jpeg",
        "/app/imagesSaved/picture_21_1.jpeg",
        "/app/imagesSaved/picture_22_1.jpeg",
        "/app/imagesSaved/picture_23_1.jpeg",
        "/app/imagesSaved/picture_24_1.jpeg",
        "/app/imagesSaved/picture_25_1.jpeg",
        "/app/imagesSaved/picture_26_1.jpeg",
        "/app/imagesSaved/picture_27_1.jpeg",
    ];

    const options = [
        "Male",
        "Female",
        "Other",
        "Non-binary"
    ];
    function randomGender() {
        return options[Math.floor(Math.random() * options.length)];
    }

    function randomSexualPreferences() {
        //return JSON array of 1 to 4 random options
        const nbOptions = Math.floor(Math.random() * (4 - 1 + 1)) + 1;
        const sexualPreferences = [];
        for (let i = 0; i < nbOptions; i++) {
            let randomOption = randomGender();
            if (!sexualPreferences.includes(randomOption)) {
                sexualPreferences.push(randomOption);
            }
        }
        return sexualPreferences;
    }


    function randomLocation() {
        //Lyon or Paris
        const options = [
            [45.764043, 4.835659, "Lyon"],
            [48.8534, 2.3488, "Paris"]
        ];
        return options[Math.floor(Math.random() * options.length)];
    }

    for (let i = 0; i < 500; i++) {
        const location = randomLocation();
        const user = {
            username: faker.internet.userName(),
            email: faker.internet.email(),
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            age: Math.floor(Math.random() * (100 - 18 + 1)) + 18,
            password: '$2y$10$C1uL8np0wHFh3I4HwbgyeOJUAX2xYYJBGTBzB9/Ml6JGDQjOkq9GK',
            token: faker.string.uuid(),
            token_creation: faker.date.recent(),
            token_expiration: faker.date.future(),
            email_checked: true,
            complete_register: true,
            gender: randomGender(),
            sexual_preferences: JSON.stringify(randomSexualPreferences()),
            biography: faker.person.bio(),
            picture_1: pictures[Math.floor(Math.random() * pictures.length)],
            picture_2: null,
            picture_3: null,
            picture_4: null,
            picture_5: null,
            fame_rating: Math.floor(Math.random() * (100 - 1 + 1)) + 1,
            location_permission: true,
            latitude: location[0],
            longitude: location[1],
            city: location[2],
            last_connection: faker.date.recent()
        };
        randomUsersForInit.push(user);
    }
    return randomUsersForInit;
}

module.exports = {
    generateRandomUsersForInit
};
