import express from 'express';
import fetch from 'node-fetch';
import queryString from 'query-string';
import cors from 'cors';
import { config } from 'dotenv';

config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.get('/login', (req, res) => {
    const scopes = 'user-read-playback-state user-modify-playback-state';
    res.json({
        url: `https://accounts.spotify.com/authorize?${new URLSearchParams({
            response_type: 'code',
            client_id: CLIENT_ID,
            scope: scopes,
            redirect_uri: REDIRECT_URI,
            show_dialog: true
        })}`
    });
});

app.get('/callback', (req, res) => {
    const code = req.query.code;
    const params = {
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
    };

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
    };

    fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: headers,
        body: queryString.stringify(params)
    })
        .then(response => response.json())
        .then(data => {
            res.redirect(`http://localhost:5500/pomodoro%20x%20spotify/public/?access_token=${data.access_token}`);
        });
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
