const firebase = require("firebase/app");
const { getStorage } = require("firebase/storage");
require('dotenv').config();

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_CENTER_ID,
    appId: process.env.FIREBASE_APP_ID,
};

firebase.initializeApp(firebaseConfig);

const storage = getStorage();

module.exports = { storage };