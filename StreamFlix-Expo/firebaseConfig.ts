import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Preencha com as credenciais do seu app Web no Firebase Console.
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

export const firebaseConfigurado = Boolean(
  firebaseConfig.apiKey !== 'SUA_API_KEY' &&
  firebaseConfig.projectId !== 'SEU_PROJECT_ID' &&
  firebaseConfig.appId !== 'SEU_APP_ID'
);

const app = firebaseConfigurado
  ? (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig))
  : null;

export const db = app ? getFirestore(app) : null;
