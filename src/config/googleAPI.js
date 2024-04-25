const { google } = require("googleapis");

const {CLIENT_SECRET, CLIENT_ID, REDIRECT_URIS} = process.env;
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URIS);

const scopes = ['https://www.googleapis.com/auth/gmail.send'];

const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
});

console.log('url auth:', url);