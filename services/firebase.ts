import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, deleteDoc, doc, query, onSnapshot, orderBy } from "firebase/firestore";

// Configuration provided in the original request
const firebaseConfig = {
    apiKey: "AIzaSyD2qwVTiRWvIsB570FCxk1w0xYmoBenZ7A",
    authDomain: "gestor-geferson.firebaseapp.com",
    projectId: "gestor-geferson",
    storageBucket: "gestor-geferson.firebasestorage.app",
    messagingSenderId: "252197907884",
    appId: "1:252197907884:android:0f99e82318e49ce53ede09"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const COLLECTION_NAME = 'movimentacoes_geferson';

export { collection, addDoc, deleteDoc, doc, query, onSnapshot, orderBy };