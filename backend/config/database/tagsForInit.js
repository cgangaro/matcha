function tagsInit() {
    const availableTags = [
        '#Sport',
        '#Music',
        '#Cinema',
        '#Travel',
        '#Art',
        '#Politics',
        '#Technology',
        '#Cooking',
        '#Fashion',
    ];
    var tagList = [];
    for (var i = 1; i <= 500; i++) {
        var tagTemp = getRandomTags(availableTags);
        for (var y = 0; y < 5; y++) {
            tagList.push({ name: tagTemp[y], owner_id: i })
        }
    }
    return tagList;
}

function getRandomTags(inputTags) {
    const randomTags = [];
    const availableTagsCopy = [...inputTags];

    for (let i = 0; i < 5; i++) {
        const randomIndex = Math.floor(Math.random() * availableTagsCopy.length);
        const randomTag = availableTagsCopy.splice(randomIndex, 1)[0];
        randomTags.push(randomTag);
    }

    return randomTags;
}

module.exports = {
    tagsInit
};