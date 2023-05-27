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


// Event listeners for buttons
playPauseButton.addEventListener('click', () => {
    if (isPaused === false) {
        isPaused = true;
        playPauseButton.textContent = 'Play';
    } else {
        isPaused = false;
        playPauseButton.textContent = 'Pause';
    }
});



skipButton.addEventListener('click', () => {
    isWorkTime = !isWorkTime;
    timeLeft = isWorkTime ? workDuration : breakDuration;
    timeSpent = 0; // Reset timeSpent
    progressBar.style.width = "0%"; // Reset progress bar
    timerDisplay.textContent = formatTime(timeLeft);
});



// Update the timer every second
let interval = setInterval(updateTimer, 1000);

