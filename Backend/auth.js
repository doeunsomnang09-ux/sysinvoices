const { google } = require("googleapis");
const fs = require("fs");
const readline = require("readline");

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

const TOKEN_PATH = "token.json";

async function authorize() {
  const credentials = JSON.parse(fs.readFileSync("credentials.json"));

  const { client_secret, client_id, redirect_uris } = credentials.installed;

  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0],
  );

  if (fs.existsSync(TOKEN_PATH)) {
    oauth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH)));

    console.log("Google Drive already authorized.");

    return;
  }

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log("\nOpen this URL in your browser:\n");
  console.log(authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("\nPaste the authorization code here: ", async (code) => {
    rl.close();

    const { tokens } = await oauth2Client.getToken(code);

    oauth2Client.setCredentials(tokens);

    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));

    console.log("\nGoogle Drive authorization successful!");
  });
}

authorize().catch(console.error);
