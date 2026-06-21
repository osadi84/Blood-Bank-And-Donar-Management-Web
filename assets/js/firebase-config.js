// Shared Firebase initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAqUpugEG4CABz266QBIE_ldWgR1eWPXqk",
    authDomain: "blood-bank-website-c2625.firebaseapp.com",
    projectId: "blood-bank-website-c2625",
    storageBucket: "blood-bank-website-c2625.firebasestorage.app",
    messagingSenderId: "778577693727",
    appId: "1:778577693727:web:4818be5b9cef354c4d192a",
    measurementId: "G-3XL1ZGCJ1R"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
