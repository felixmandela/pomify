# Pomify - Pomodoro Timer for Spotify 🍅🎵

## Author 📝
This project is created and maintained by Felix Mandela.

## Description 📚
Pomify is a productivity-enhancing web app that brings the principles of the Pomodoro Technique to Spotify listeners. It allows users to time their work and break sessions, while also syncing Spotify playback with the Pomodoro play/pause button, allowing seamless integration between work rhythms and musical enjoyment.

## Tasks Completed ✅

1. Creating a Pomodoro Timer
2. Synchronizing the Timer with Spotify Music Playback 
3. Handling Spotify Authorization and Refresh Tokens
4. Building the User Interface with Interactive Elements

## Challenges Faced 👊

1. Dealing with the asynchronous nature of JavaScript when working with Spotify's Web API.
2. Syncing the timer with Spotify music playback was a challenge. It involved handling playback controls using the Spotify Web API, which required managing access and refresh tokens.
3. Managing time calculations and displaying the updated time on the UI.

## Solutions Devised 🛠️

1. Integrated Spotify's Web API for playback control and managed Spotify tokens for authorization.
2. Created a detailed feedback system on the UI to inform the user about the exact issue preventing playback.
3. Performed calculations and state updates to keep the timer, progress bar, and Spotify playback in sync.

## Learnings 🎓

1. Working with Spotify's Web API.
2. Understanding Pomodoro technique and how it can be digitally implemented.
3. Handling server-side token refresh for OAuth 2.0.

## To-do List of Improvements 📝

1. [ ] Add an ability to reset the timer.
2. [ ] Introduce persistent user settings (possibly using LocalStorage).
3. [ ] Modularize code to enhance maintainability and readability.
4. [ ] Incorporate database to store credentials and/or tokens.
5. [ ] Improve error handling for various network issues and unexpected responses.
6. [ ] Add a feature for users to set a playlist for work and break sessions.

## Getting Started 🚀

### Prerequisites
You will need a Spotify premium account to use this app.

### Setup
1. Visit [Pomify Website](https://pomify.vercel.app)
2. Click on "Connect with Spotify" to link your Spotify account with Pomify.
3. Set your preferred work and break durations.
4. Click on "Play" to start the timer and enjoy your productivity boost with Pomify! 🚀
