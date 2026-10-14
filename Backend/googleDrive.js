const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const credentialsPath = path.join(__dirname, "credentials.json");
const tokenPath = path.join(__dirname, "token.json");

const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));

const { client_secret, client_id, redirect_uris } = credentials.installed;

const oauth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0],
);

// Load Google authorization
if (fs.existsSync(tokenPath)) {
  const token = JSON.parse(fs.readFileSync(tokenPath, "utf8"));

  oauth2Client.setCredentials(token);
} else {
  console.log("token.json not found.");
}

const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

module.exports = {
  drive,
  oauth2Client,
};
