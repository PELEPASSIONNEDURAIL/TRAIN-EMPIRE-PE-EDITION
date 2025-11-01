// =======================
// FONCTIONS MULTICOMPTE
// =======================

// Créer un compte
async function authCreerCompte(pseudo, mdp) {
    const userRef = firebase.firestore().collection("users").doc(pseudo);
    const doc = await userRef.get();
    if (doc.exists) return false; // pseudo déjà utilisé

    // Hash simple du mot de passe (à améliorer si sécurité critique)
    const mdpHash = btoa(mdp);

    await userRef.set({
        mdpHash: mdpHash,
        dateCreation: Date.now(),
        compagnie: "Ma Compagnie", // valeur par défaut
        dataJeu: {}
    });
    return true;
}

// Connexion
async function authConnexion(pseudo, mdp) {
    const userRef = firebase.firestore().collection("users").doc(pseudo);
    const doc = await userRef.get();
    if (!doc.exists) return false;

    const mdpHash = btoa(mdp);
    if (doc.data().mdpHash !== mdpHash) return false;

    // Retourne les données du joueur
    return doc.data();
}

// Sauvegarde des données du joueur
async function sauvegarderDonnees(pseudo, dataJeu) {
    const userRef = firebase.firestore().collection("users").doc(pseudo);
    await userRef.update({
        dataJeu: dataJeu
    });
}

// Chargement des données du joueur
async function chargerDonnees(pseudo) {
    const userRef = firebase.firestore().collection("users").doc(pseudo);
    const doc = await userRef.get();
    if (doc.exists) return doc.data().dataJeu;
    return null;
}

// =======================
// GESTION AFFICHAGE PSEUDO / COMPAGNIE
// =======================
function afficherInfosJoueur(pseudo, compagnie) {
    document.getElementById('pseudoJoueur').textContent = pseudo;
    document.getElementById('compagnieJoueur').textContent = compagnie || "Non définie";
    document.getElementById('infoJoueur').style.display = 'block';
}
