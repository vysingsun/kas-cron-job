const cron = require("node-cron");
const axios = require('axios');
const fs = require('fs');

const START_INDEX_FILE = './startIndex.json';

function getStartIndex() {
    try {
        if (fs.existsSync(START_INDEX_FILE)) {
            return parseInt(fs.readFileSync(START_INDEX_FILE, 'utf8'), 10) || 1300;
        }
    } catch (err) {}
    return 1300;
}

function updateStartIndex(newIndex) {
    try {
        fs.writeFileSync(START_INDEX_FILE, newIndex.toString(), 'utf8');
    } catch (err) {}
}

// Runs at 9:00 AM every day (only once per day)
cron.schedule("0 9 * * *", () => {
    let startIndex = getStartIndex();
    console.log(`Start index: ${startIndex}`);
    register(startIndex);
    updateStartIndex(startIndex + 35);
});

function register(startIndex) {
    try {
        const nameData = fs.readFileSync('./first-names.json', 'utf8');
        const data = fs.readFileSync('./aspire_user.json', 'utf8');
        const jsonData = JSON.parse(data);
        let nameJson = JSON.parse(nameData);
    
        jsonData.slice(startIndex, startIndex + 35).forEach((e, index) => {
            if (index >= nameJson.length) return;
    
            const randomName = nameJson[index];
            const randomPhoneNumber = `0${Math.floor(100000000 + Math.random() * 900000000)}`;
            const randomYearOfBirth = Math.floor(Math.random() * (2008 - 1980 + 1)) + 1980;
            const username = `${randomName.toLowerCase()}${Math.random().toString(36).substring(2, 8)}saambatself`;

            axios.post('https://core.kas.gov.kh/auth/register-user-password', {
                "username": username,
                "password": "123456789",
                "first_name": e.first_name || "សុខ",
                "last_name": e.last_name || "សុខ",
                "gender": e.gender == "M" ? "male" : "female",
                "phone_number": randomPhoneNumber,
                "year_of_birth": randomYearOfBirth
            }).then((res) => {
                return axios.post('https://core.kas.gov.kh/auth/authenticate', {
                    "identifier": username,
                    "password": "123456789"
                });
            }).catch((error) => {});
        });
    } catch (err) {}
}