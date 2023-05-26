let timer = document.getElementById('timer');
let progressBar = document.getElementById('progress');
let playPauseBtn = document.getElementById('play-pause-btn');
let skipBtn = document.getElementById('skip-btn');
let notification = document.getElementById('notification');

let isRunning = false;
let workTime = 25 * 60;
let breakTime = 5 * 60;
let remainingTime = workTime;
let currentInterval = workTime;

function startTimer() {
    if (isRunning) return;
    isRunning = true;
    countdown = setInterval(function () {
        if (remainingTime <= 0) {
            clearInterval(countdown);
            notification.play();
            switchInterval();
            startTimer();
        } else {
            remainingTime--;
            updateDisplay();
        }
    }, 1000);
}

function pauseTimer() {
    isRunning = false;
    clearInterval(countdown);
}

function switchInterval() {
    if (currentInterval === workTime) {
        currentInterval = breakTime;
        remainingTime = breakTime;
    } else {
        currentInterval = workTime;
        remainingTime = workTime;
    }
    updateDisplay();
}

function updateDisplay() {
    let minutes = Math.floor(remainingTime / 60);
    let seconds = remainingTime % 60;
    timer.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    progressBar.style.width = `${(1 - remainingTime / currentInterval) * 100}%`;
}

playPauseBtn.addEventListener('click', function () {
    if (isRunning) {
        pauseTimer();
        this.textContent = 'Play';
    } else {
        startTimer();
        this.textContent = 'Pause';
    }
});

skipBtn.addEventListener('click', function () {
    switchInterval();
    if (isRunning) {
        pauseTimer();
        startTimer();
    }
});

updateDisplay();
