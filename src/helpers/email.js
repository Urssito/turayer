const mailComposer = require('nodemailer/lib/mail-composer');
const {google} = require('googleapis');
const tokens = require('../config/token.json');

const gmailService = () => {
    const {CLIENT_SECRET, CLIENT_ID, REDIRECT_URIS} = process.env;
    const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URIS);
    oAuth2Client.setCredentials(tokens);
    return google.gmail({version: 'v1', auth: oAuth2Client});
};

const encodeMessage = (message) => {
    return Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const createMail = async (options) => {
    const MailComposer = new mailComposer(options);
    return encodeMessage(await MailComposer.compile().build());
}

const sendMail = async(options) => {
    const gmail = gmailService();
    const rawMessage = await createMail(options);
    const { data: { id } = {} } = await gmail.users.messages.send({
        userId: 'me',
        resource: {
          raw: rawMessage,
        },
      });
      return id;
};

module.exports = sendMail;