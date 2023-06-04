// Variables and constants
let spotifyAccessToken;
let isWorkTime = true;
let isPaused = true;
let timeSpent = 0; // Initialize timeSpent variable
let currentSession = 1;
let workDuration, breakDuration, timeLeft;
let isTempWorkDuration = null;
let isTempBreakDuration = null;
const urlSearchParams = new URLSearchParams(window.location.search);

// DOM selectors
const timerDisplay = document.querySelector('#timer');
const playPauseButton = document.querySelector('#play-pause-btn');
const skipButton = document.querySelector('#skip-btn');
const progressBar = document.querySelector("#progress");
const workDurationInput = document.querySelector('#work-duration');
const breakDurationInput = document.querySelector('#break-duration');
const sessionStatus = document.getElementById('session-status');
const breakStatus = document.getElementById('break-status');
const loginButton = document.querySelector('#spotify-login-btn');
const openSpotifyButton = document.querySelector('#open-spotify-btn');
const modal = document.getElementById("settings-modal");
const settingsButton = document.getElementById("settings-btn");
const closeButton = document.getElementById("close-btn");
const applySettingsButton = document.getElementById("apply-settings");

// Function definitions
function formatTime(time) {
    let minutes = Math.floor(time / 60);
    let seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
function updateTimer() {
    if (!isPaused) {
        if (timeLeft > 0) {
            timeSpent++; // Increase timeSpent every second
            let progressPercentage = (timeSpent / (isWorkTime ? workDuration : breakDuration)) * 100;
            progressBar.style.width = progressPercentage + "%"; // Modify the width of the progress bar
            timeLeft--;
            timerDisplay.textContent = formatTime(timeLeft);
        } else {
            let sessionStatus = document.getElementById('session-status');
            let breakStatus = document.getElementById('break-status');
            if (isWorkTime === false) {
                // If the session is not paused, change the text to "Ongoing"
                sessionStatus.textContent = `Session ${currentSession.toString().padStart(2, '0')} || `;
                breakStatus.textContent = "Ongoing";
                startNewSession()
            } else {
                // If the session is paused, change the text to "Break"
                sessionStatus.textContent = `Session ${currentSession.toString().padStart(2, '0')} || `;
                breakStatus.textContent = "Break";
            }
            isWorkTime = !isWorkTime;
            timeLeft = isWorkTime ? workDuration : breakDuration;
            timeSpent = 0; // Reset timeSpent
            progressBar.style.width = "0%"; // Reset progress bar
            playNotificationSound()
        }
    }
}
function startNewSession() { // Increment the session count
    currentSession++;
    // Update the session text
    sessionStatus.textContent = `Session ${currentSession.toString().padStart(2, '0')} || `;
    breakStatus.textContent = "Ongoing";
}
function managePlayback(isPlaying) {
    const url = isPlaying ? 'https://api.spotify.com/v1/me/player/play' : 'https://api.spotify.com/v1/me/player/pause';
    fetch(url, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + spotifyAccessToken }
    })
        .then(response => {
            if (response.status === 401) { // Access token has expired
                fetch('https://pomify.onrender.com/refresh_token')
                    .then(response => response.json())
                    .then(data => {
                        spotifyAccessToken = data.access_token; // Update the access token
                        managePlayback(isPlaying); // Retry the playback request
                    })
                    .catch(error => console.error(error));
            }
        })
        .catch(error => console.error(error));
}
function playNotificationSound() {
    const switchSound = new Audio('assets/pomodoro-timers-up.mp3')
    switchSound.play()
}
function fetchSpotifyPlayerState() {
    // Check if the user has logged in before trying to fetch the Spotify status
    if (!spotifyAccessToken) {
        const initialStatus = document.querySelector('#initial-status');
        initialStatus.textContent = 'Link your Spotify account and play a song to synchronize the pomodoro timer with the music playback.';
        return;
    }

    fetch('https://api.spotify.com/v1/me/player', {
        headers: { 'Authorization': 'Bearer ' + spotifyAccessToken }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            if (response.status === 204) {
                throw new Error('No device and track enabled');
            }
            return response.json();
        })
        .then(data => {
            const initialStatus = document.querySelector('#initial-status');
            const deviceElement = document.querySelector('#spotify-device');
            const trackElement = document.querySelector('#spotify-track');
            const nowPlayingStatus = document.querySelector('#now-playing');
            const deviceStatus = document.querySelector('#device-status');


            initialStatus.textContent = '';
            if (data.device) {
                deviceStatus.textContent = 'Device: ';
                deviceElement.textContent = data.device.name;
            } else {
                deviceStatus.textContent = 'Device: ';
                deviceElement.textContent = 'No active device. Please open Spotify and connect to a device.';
            }

            if (data && data.item) {
                nowPlayingStatus.textContent = 'Now playing: ';
                trackElement.textContent = data.item.name + ' by ' + data.item.artists[0].name;
            } else {
                nowPlayingStatus.textContent = 'Now playing: ';
                trackElement.textContent = 'No track playing. Please initiate playback on Spotify.';
            }
        })
        .catch(error => {
            const initialStatus = document.querySelector('#initial-status');
            const deviceElement = document.querySelector('#spotify-device');
            const trackElement = document.querySelector('#spotify-track');
            const nowPlayingStatus = document.querySelector('#now-playing');
            const deviceStatus = document.querySelector('#device-status');

            if (error.message.includes('premium')) {
                initialStatus.textContent = 'Your account is not premium. You need a premium account to use this feature.';
            } else {
                initialStatus.textContent = 'Error retrieving track. Please initiate playback on Spotify.';
            }
            deviceStatus.textContent = '';
            deviceElement.textContent = '';
            nowPlayingStatus.textContent = '';
            trackElement.textContent = '';
            console.error('Error:', error);
        });
}

// Event listeners
openSpotifyButton.addEventListener('click', () => { window.open('https://open.spotify.com', '_blank'); });
loginButton.addEventListener('click', () => {
    // Make a GET request to the server's /login endpoint
    fetch('https://pomify.onrender.com/login')
        .then(response => response.json())
        .then(data => {
            // Redirect the user to the Spotify authorization URL
            window.location.href = data.url;
        })
        .catch(error => console.error(error));
});
playPauseButton.addEventListener('click', () => {
    breakStatus.classList.add("session-active")
    if (isPaused === false) {
        isPaused = true;
        playPauseButton.classList.remove('pause');
        playPauseButton.classList.add('play');
        playPauseButton.textContent = 'Play';
        // Only handle playback if an access token exists
        if (spotifyAccessToken) {
            managePlayback(false); // Pause Spotify playback
        }
    } else {
        isPaused = false;
        playPauseButton.classList.remove('play');
        playPauseButton.classList.add('pause');
        playPauseButton.textContent = 'Pause';
        // Only handle playback if an access token exists
        if (spotifyAccessToken) {
            managePlayback(true); // Start Spotify playback
        }
    }

    if (isWorkTime === true) {
        // If the session is not paused, change the text to "Ongoing"
        sessionStatus.textContent = `Session ${currentSession.toString().padStart(2, '0')} || `;
        breakStatus.textContent = `Ongoing`;
    } else {
        // If the session is paused, change the text to "Break"
        sessionStatus.textContent = `Session ${currentSession.toString().padStart(2, '0')} || `;
        breakStatus.textContent = `Break`;
    }
});
skipButton.addEventListener('click', () => {
    if (isWorkTime === false) {
        // If the session is not paused, change the text to "Ongoing"
        sessionStatus.textContent = `Session ${currentSession.toString().padStart(2, '0')} || `;
        breakStatus.textContent = "Ongoing";
        startNewSession()
    } else {
        // If the session is paused, change the text to "Break"
        sessionStatus.textContent = `Session ${currentSession.toString().padStart(2, '0')} || `;
        breakStatus.textContent = "Break";
    }

    isWorkTime = !isWorkTime;
    timeLeft = isWorkTime ? workDuration : breakDuration;
    timeSpent = 0; // Reset timeSpent
    progressBar.style.width = "0%"; // Reset progress bar
    timerDisplay.textContent = formatTime(timeLeft);
});
workDurationInput.addEventListener('change', (e) => { isTempWorkDuration = e.target.value; });
breakDurationInput.addEventListener('change', (e) => { isTempBreakDuration = e.target.value; });
applySettingsButton.addEventListener('click', () => {
    if (isTempWorkDuration !== null) {
        workDuration = isTempWorkDuration * 60;
        if (isWorkTime) {
            timeLeft = workDuration;
            timerDisplay.textContent = formatTime(timeLeft);
        }
    }

    if (isTempBreakDuration !== null) {
        breakDuration = isTempBreakDuration * 60;
        if (!isWorkTime) {
            timeLeft = breakDuration;
            timerDisplay.textContent = formatTime(timeLeft);
        }

    }
    // Reset temporary settings
    isTempWorkDuration = null;
    isTempBreakDuration = null;
    // To reset progress bar
    timeSpent = 0;
    modal.classList.remove('show');
});
settingsButton.onclick = function () { modal.classList.add('show'); };
closeButton.onclick = function () { modal.classList.remove('show'); };
window.onclick = function (event) {
    if (event.target == modal) {
        modal.classList.remove('show');
    }
};

// Initial actions
if (urlSearchParams.has('access_token')) {
    spotifyAccessToken = urlSearchParams.get('access_token');
    // Hide the login button and show the "Open Spotify" button
    loginButton.style.display = 'none';
    openSpotifyButton.style.display = 'block';
} else {
    loginButton.style.display = 'block';
    openSpotifyButton.style.display = 'none';
}
workDuration = workDurationInput.value * 60;
breakDuration = breakDurationInput.value * 60;
timeLeft = workDuration;
let timeUpdateInterval = setInterval(updateTimer, 1000);
setInterval(fetchSpotifyPlayerState, 5000);
