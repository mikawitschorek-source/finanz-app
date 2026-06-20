import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC2phwQy9ZaUDKIeWFF6ps7mmb9Z7JCZc8",
  authDomain: "finance-mika.firebaseapp.com",
  projectId: "finance-mika",
  storageBucket: "finance-mika.firebasestorage.app",
  messagingSenderId: "1042847837712",
  appId: "1:1042847837712:web:076a35faf04077fc75a495",
  measurementId: "G-ZEXCR5CMCW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
