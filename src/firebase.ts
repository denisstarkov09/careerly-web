// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBdnDmGR2cvqVaH-rJy3okQ_h5-joI9G5s",
    authDomain: "careerly-extension.firebaseapp.com",
    projectId: "careerly-extension",
    storageBucket: "careerly-extension.appspot.com",
    messagingSenderId: "413895471740",
    appId: "1:413895471740:web:d36b9b9ae89364f1220ff9",
    measurementId: "G-Z4SF2F30F5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// It will be imported into your react app whenever it is needed
export const db = getFirestore(app);
