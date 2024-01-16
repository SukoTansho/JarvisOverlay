const twitch = require('twitch');
const config = require('config');

// Hier kannst du den Twitch-API-Code hinzufügen

// Beispiel:
const clientId = config.twitch.clientId;
const clientSecret = config.twitch.clientSecret;

const api = new twitch.Api({
  client_id: clientId,
  client_secret: clientSecret,
});