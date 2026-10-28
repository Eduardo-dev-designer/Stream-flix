// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAwS5tDbb34r83uIlGobY0CuQmbwGO9GXk",
  authDomain: "stream-flix-85202.firebaseapp.com",
  databaseURL: "https://stream-flix-85202-default-rtdb.firebaseio.com",
  projectId: "stream-flix-85202",
  storageBucket: "stream-flix-85202.firebasestorage.app",
  messagingSenderId: "828083152450",
  appId: "1:828083152450:web:61a80c2082b78613126fdb",
  measurementId: "G-NPZ3MFD85S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);