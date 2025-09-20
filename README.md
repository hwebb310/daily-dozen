# Daily Dozen - Productivity App

A simple, satisfying daily to-do app with 4 life areas (Work, Personal, Life, Misc) containing 3 tasks each.

## Features
- ✅ 12 daily tasks across 4 life areas
- 🎉 Satisfying completion effects (sound + fireworks)
- 📊 Progress tracking
- 🔄 Daily reset functionality
- ☁️ Cloud sync with Firebase Firestore
- 📱 Responsive design

## Quick Setup for GitHub Pages

### 1. Create GitHub Repository
1. Go to [GitHub](https://github.com) and create a new repository
2. Name it something like `daily-dozen` (make it public)
3. Don't initialize with README (we'll upload our files)

### 2. Upload Files
1. Download/copy all files from this project:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `README.md`
2. Upload them to your GitHub repository

### 3. Enable GitHub Pages
1. Go to your repo → Settings → Pages
2. Under "Source", select "Deploy from a branch"
3. Choose "main" branch and "/ (root)" folder
4. Click Save
5. Your site will be available at: `https://yourusername.github.io/daily-dozen`

### 4. Firebase Setup (Required for cloud sync)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (name it anything you like)
3. Add a web app to your project
4. Copy the Firebase config object
5. In `script.js`, replace the placeholder config with your actual config

## Firebase Configuration
Replace the placeholder config in `script.js` with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## Local Development
Simply open `index.html` in your browser. The app works offline but won't sync without Firebase setup.

## Technologies Used
- Vanilla HTML/CSS/JavaScript
- Google Fonts (Open Sans)
- Firebase Firestore
- Web Audio API for sound effects
- Canvas API for fireworks

Enjoy your daily productivity tracking! 🌱