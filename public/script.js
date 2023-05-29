let accessToken;
const loginButton = document.querySelector('#spotify-login-btn');
const openSpotifyButton = document.querySelector('#open-spotify-btn');

// Load the access token from the URL if present
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('access_token')) {
    accessToken = urlParams.get('access_token');
    // Hide the login button and show the "Open Spotify" button
    loginButton.style.display = 'none';
    openSpotifyButton.style.display = 'block';
} else {
    loginButton.style.display = 'block';
    openSpotifyButton.style.display = 'none';
}

openSpotifyButton.addEventListener('click', () => {
    window.open('https://open.spotify.com', '_blank');
});

loginButton.addEventListener('click', () => {
    // Make a GET request to the server's /login endpoint
    fetch('http://localhost:3000/login')
        .then(response => response.json())
        .then(data => {
            // Redirect the user to the Spotify authorization URL
            window.location.href = data.url;
        })
        .catch(error => console.error(error));
});

const timerDisplay = document.querySelector('#timer');
const playPauseButton = document.querySelector('#play-pause-btn');
const skipButton = document.querySelector('#skip-btn');
const progressBar = document.querySelector("#progress");
const workDurationInput = document.querySelector('#work-duration');
const breakDurationInput = document.querySelector('#break-duration');

let isWorkTime = true;
let isPaused = true;
let workDuration = workDurationInput.value * 60; // get value from input
let breakDuration = breakDurationInput.value * 60; // get value from input
let timeLeft = workDuration;
let timeSpent = 0; // Initialize timeSpent variable

// Update workDuration and breakDuration when the inputs change
workDurationInput.addEventListener('change', () => {
    workDuration = workDurationInput.value * 60;
    if (isWorkTime) {
        timeLeft = workDuration;
        timerDisplay.textContent = formatTime(timeLeft);
    }
});

breakDurationInput.addEventListener('change', () => {
    breakDuration = breakDurationInput.value * 60;
    if (!isWorkTime) {
        timeLeft = breakDuration;
        timerDisplay.textContent = formatTime(timeLeft);
    }
});



// time formatting
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
            isWorkTime = !isWorkTime;
            timeLeft = isWorkTime ? workDuration : breakDuration;
            timeSpent = 0; // Reset timeSpent
            progressBar.style.width = "0%"; // Reset progress bar
        }
    }
}


// When the Play button is clicked, start the Spotify playback
playPauseButton.addEventListener('click', () => {
    if (isPaused === false) {
        isPaused = true;
        playPauseButton.textContent = 'Play';
        // Only handle playback if an access token exists
        if (accessToken) {
            handlePlayback(false); // Pause Spotify playback
        }
    } else {
        isPaused = false;
        playPauseButton.textContent = 'Pause';
        // Only handle playback if an access token exists
        if (accessToken) {
            handlePlayback(true); // Start Spotify playback
        }
    }
});



// Start or pause Spotify playback
function handlePlayback(isPlaying) {
    const url = isPlaying ? 'https://api.spotify.com/v1/me/player/play' : 'https://api.spotify.com/v1/me/player/pause';
    fetch(url, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + accessToken }
    })
        .then(response => {
            if (response.status === 401) { // Access token has expired
                fetch('http://localhost:3000/refresh_token')
                    .then(response => response.json())
                    .then(data => {
                        accessToken = data.access_token; // Update the access token
                        handlePlayback(isPlaying); // Retry the playback request
                    })
                    .catch(error => console.error(error));
            } else if (!response.ok) { // If there is an error with the playback
                showNotification("Please open Spotify on your device and ensure a track is playing.");
            }
        })
        .catch(error => console.error(error));
}


skipButton.addEventListener('click', () => {
    isWorkTime = !isWorkTime;
    timeLeft = isWorkTime ? workDuration : breakDuration;
    timeSpent = 0; // Reset timeSpent
    progressBar.style.width = "0%"; // Reset progress bar
    timerDisplay.textContent = formatTime(timeLeft);
});

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.remove('hidden');
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.add('hidden');
    }, 3000); // Hide the notification after 3 seconds
}

// Update the timer every second
let interval = setInterval(updateTimer, 1000);


function fetchSpotifyPlayerState() {
    // Check if the user has logged in before trying to fetch the Spotify status
    if (!accessToken) {
        return;
    }

    fetch('https://api.spotify.com/v1/me/player', {
        headers: { 'Authorization': 'Bearer ' + accessToken }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const deviceElement = document.querySelector('#spotify-device');
            const trackElement = document.querySelector('#spotify-track');

            if (data.device) {
                deviceElement.textContent = 'Device: ' + data.device.name;
            } else {
                deviceElement.textContent = 'Device: No active device. Please open Spotify and connect to a device.';
            }

            if (data && data.item) {
                trackElement.textContent = 'Now playing: ' + data.item.name + ' by ' + data.item.artists[0].name;
            } else {
                trackElement.textContent = 'Now playing: No track playing. Please initiate playback on Spotify.';
            }
        })
        .catch(error => {
            const deviceElement = document.querySelector('#spotify-device');
            const trackElement = document.querySelector('#spotify-track');

            deviceElement.textContent = 'Device: Error retrieving device status.';
            trackElement.textContent = 'Now playing: Error retrieving track. Please initiate playback on Spotify.';

            console.error('Error:', error);
        });
}

// Call the function every 5 seconds to keep the status updated
setInterval(fetchSpotifyPlayerState, 5000);



