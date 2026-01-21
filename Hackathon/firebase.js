// Your Firebase Web App config
const firebaseConfig = {
  apiKey: "AIzaSyAWD64cSqDgn-bMekjbnlyM-8X3FRT_ajQ",
  authDomain: "gov-schemes-portal.firebaseapp.com",
  projectId: "gov-schemes-portal",
  storageBucket: "gov-schemes-portal.firebasestorage.app",
  messagingSenderId: "865910690526",
  appId: "1:865910690526:web:13fe0dec71758c484da84f",
  measurementId: "G-K2ZCDVE4R7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Make auth & db global
window.auth = firebase.auth();
window.db = firebase.firestore();
