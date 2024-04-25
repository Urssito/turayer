const {google} = require('googleapis');
const updateDotenv = require('update-dotenv');
const fs = require('fs')
const path = require('path')

const {CODE, CLIENT_SECRET, CLIENT_ID, REDIRECT_URIS} = process.env;
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URIS);

oAuth2Client.getToken('4/0AdQt8qh-y37YMO7NqkNjbKgMJBXuLylg3Or9vHLPTablJZO0kYCUnAfPGcYVRU5D1BrFYg').then(({tokens}) => {
    const tokenPath = path.join(__dirname, 'token.json');
    fs.writeFileSync(tokenPath, JSON.stringify(tokens));
    console.log('Access token and refresh token stored to token.json');
})