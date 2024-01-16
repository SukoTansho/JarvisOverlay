const express = require('express');
const axios = require('axios');
const http = require('http');
const WebSocket = require('ws');
const config = require('config');

const app = express();
const port = 3000;

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Hier die Twitch-API-Zugangsdaten eintragen
const clientId = config.twitch.clientId;
const clientSecret = config.twitch.clientSecret;
const twitchUsername = config.twitch.username;

// Diese URL ist für die Authorization Code Flow erforderlich
const redirectUri = 'http://localhost:3000/auth/callback';

// Hier kannst du die Pfade für Follower und Subscriber-Grafiken anpassen
const followerGraphicPath = 'path/to/follower-graphic.png';
const subscriberGraphicPath = 'path/to/subscriber-graphic.png';

let wsConnection;

// Authentifizierungsschritte
app.get('/auth', (req, res) => {
  const scopes = 'channel:read:subscriptions';

  res.redirect(
    `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}`
  );
});

app.get('/auth/callback', async (req, res) => {
  const code = req.query.code;

  try {
    // Token abrufen
    const tokenResponse = await axios.post(
      'https://id.twitch.tv/oauth2/token',
      null,
      {
        params: {
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Verbindung zum Twitch-Chat herstellen
    const twitchChatConnection = new WebSocket('wss://irc-ws.chat.twitch.tv:443');

    twitchChatConnection.on('open', () => {
      console.log('Verbunden mit dem Twitch-Chat');
    });

    twitchChatConnection.on('message', (message) => {
      console.log('Nachricht vom Twitch-Chat:', message);

      // Hier kannst du den Nachrichten-Code für Follower und Subscriber-Events überprüfen
      // und dann die Aktion auslösen, um die Grafik im Overlay zu aktualisieren
      // Zum Beispiel: wsConnection.send(JSON.stringify({ type: 'showGraphic', event: 'follower' }));
    });

    wsConnection = res.io;

    res.send('Authentifizierung erfolgreich. Du kannst nun das Overlay starten.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Fehler bei der Authentifizierung.');
  }
});

// WebSocket-Endpunkt für die Client-Seite
wss.on('connection', (ws) => {
  console.log('Client verbunden');

  ws.on('close', () => {
    console.log('Client getrennt');
  });
});

// Starte den Express-Server
app.use(express.static('src'));

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});