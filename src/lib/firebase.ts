import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyATor1ZYsuwl49c895ylAst8ZTB0DNWCvQ",
  authDomain: "thikabizhub.firebaseapp.com",
  projectId: "thikabizhub",
  storageBucket: "thikabizhub.firebasestorage.app",
  messagingSenderId: "728262533635",
  appId: "1:728262533635:web:88db50462b0a33fb8da436",
  measurementId: "G-D6W9B0F724"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Enable offline persistence (only in browser environment)
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support all of the features required to enable persistence');
    }
  });
}

export { db, auth, storage };
export default app;
