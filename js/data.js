// js/data.js
import { db } from "./firebase.js";
import { collection, getDocs, setDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// =======================
// TRAINS
// =======================
export async function getTrains() {
    const snapshot = await getDocs(collection(db, "trains"));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function ajouterTrain(id, nom, type) {
    await setDoc(doc(db, "trains", id), {
        nom,
        type,
        dateCreation: new Date().toISOString()
    });
}

export function listenTrains(callback) {
    const trainsRef = collection(db, "trains");
    onSnapshot(trainsRef, (snapshot) => {
        const trains = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(trains);
    });
}

// =======================
// LIGNES
// =======================
export async function getLignes() {
    const snapshot = await getDocs(collection(db, "lignes"));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function ajouterLigne(id, nom) {
    await setDoc(doc(db, "lignes", id), {
        nom,
        dateCreation: new Date().toISOString()
    });
}

export function listenLignes(callback) {
    const lignesRef = collection(db, "lignes");
    onSnapshot(lignesRef, (snapshot) => {
        const lignes = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(lignes);
    });
}

// =======================
// SILLONS
// =======================
export async function getSillons() {
    const snapshot = await getDocs(collection(db, "sillons"));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function ajouterSillon(id, ligne, horaire) {
    await setDoc(doc(db, "sillons", id), {
        ligne,
        horaire,
        dateCreation: new Date().toISOString()
    });
}

export function listenSillons(callback) {
    const sillonsRef = collection(db, "sillons");
    onSnapshot(sillonsRef, (snapshot) => {
        const sillons = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(sillons);
    });
}

// =======================
// UTILISATEURS
// =======================
export async function getUsers() {
    const snapshot = await getDocs(collection(db, "users"));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function ajouterUser(id, pseudo) {
    await setDoc(doc(db, "users", id), {
        pseudo,
        dateCreation: new Date().toISOString()
    });
}

export function listenUsers(callback) {
    const usersRef = collection(db, "users");
    onSnapshot(usersRef, (snapshot) => {
        const users = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(users);
    });
}

// =======================
// FONCTIONS GÉNÉRIQUES POUR AJOUTER / LIRE COLLECTIONS
// =======================
export async function getCollection(name) {
    const snapshot = await getDocs(collection(db, name));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function ajouterDoc(collectionName, id, data) {
    await setDoc(doc(db, collectionName, id), {
        ...data,
        dateCreation: new Date().toISOString()
    });
}

export function listenCollection(collectionName, callback) {
    const colRef = collection(db, collectionName);
    onSnapshot(colRef, (snapshot) => {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(docs);
    });
}
