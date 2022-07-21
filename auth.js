const {GoogleAuth} = require('google-auth-library');
const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({
    keyFile: './credentials.json',
    scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.appdata',
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/drive.metadata.readonly',
        'https://www.googleapis.com/auth/drive.metadata',
        'https://www.googleapis.com/auth/drive.photos.readonly'
    ],
});

module.exports = auth;