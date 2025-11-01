// js/firebase.js
// ----------------------
// Firebase (modular) initialization (conserve la partie fournie par Firebase)
// ----------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
    getFirestore,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// =======================
// CONFIGURATION FIREBASE
// (conserve ta config existante)
const firebaseConfig = {
    apiKey: "AIzaSyCZ0aKxn8Nxao8vlluD0nTbBssG7lzSwPo",
    authDomain: "rail-empire-b5278.firebaseapp.com",
    projectId: "rail-empire-b5278",
    storageBucket: "rail-empire-b5278.firebasestorage.app",
    messagingSenderId: "391417610159",
    appId: "1:391417610159:web:18c8ec8b692d9cbee0b95a",
    measurementId: "G-TME87RHCTC"
};

// =======================
// INITIALISATION FIREBASE (inchangée)
// =======================
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// =======================
// LOGIQUE: lecture gameState toutes les minutes + utilitaires UI
// =======================

/**
 * Lit le document gameState/global et renvoie l'objet data,
 * ou null si le doc n'existe pas.
 */
export async function fetchGameState() {
    try {
        const ref = doc(db, "gameState", "global");
        const snapshot = await getDoc(ref);
        if (!snapshot.exists()) return null;
        return snapshot.data();
    } catch (err) {
        console.error("Erreur fetchGameState:", err);
        return null;
    }
}

/**
 * Met à jour l'UI avec les données du gameState.
 * Remplace ces sélecteurs par ce que tu utilises si besoin.
 */
export async function updateGameUI() {
    const data = await fetchGameState();
    if (!data) {
        console.warn("Aucun état de jeu trouvé (gameState/global).");
        return;
    }

    // Mise à jour des éléments existants dans ton index.html
    // Si un élément n'existe pas on ignore silencieusement.
    const elFret = document.getElementById("stat-fret");
    const elVoy = document.getElementById("stat-voyageurs");
    const elTrains = document.getElementById("stat-trains");
    const elInc = document.getElementById("stat-incidents");

    if (elFret) elFret.textContent = (data.fretTotal ?? 0) + " t";
    if (elVoy) elVoy.textContent = String(data.voyageurs ?? 0);
    if (elTrains) elTrains.textContent = String(data.trainsActifs ?? 0);
    if (elInc) elInc.textContent = String(data.incidents ?? 0);

    // éventuellement log utile en dev
    // console.log("GameState mis à jour :", data);
}

// =======================
// DOM helpers & dev button
// =======================

/**
 * Hide/show menu helpers (assume menu id = "menuConnexion" or "menu")
 */
export function hideMenu() {
    const menu = document.getElementById("menuConnexion") || document.getElementById("menu");
    if (menu) menu.style.display = "none";

    // if you also used a blurred main area, re-enable it
    const main = document.querySelector("main");
    if (main) {
        main.style.filter = "";
        main.style.pointerEvents = "auto";
    }
}

export function showMenu() {
    const menu = document.getElementById("menuConnexion") || document.getElementById("menu");
    if (menu) menu.style.display = "flex";

    const main = document.querySelector("main");
    if (main) {
        main.style.filter = "blur(5px)";
        main.style.pointerEvents = "none";
    }
}

/**
 * Dev skip: force la fermeture du menu et charge l'état du jeu
 */
export async function devSkipMenu() {
    hideMenu();
    await updateGameUI();
    // ensure game content visible if present
    const jeu = document.getElementById("jeu");
    if (jeu) jeu.style.display = "block";
    console.log("DEV skip : overlay retiré et gameState chargé.");
}

// =======================
// Auto-refresh every minute (et exécution immédiate au chargement)
// =======================
let _refreshIntervalId = null;

export function startAutoRefresh(intervalMs = 60_000) {
    // exécute tout de suite
    updateGameUI().catch(err => console.error(err));

    // évite de démarrer plusieurs timers
    if (_refreshIntervalId) clearInterval(_refreshIntervalId);
    _refreshIntervalId = setInterval(() => {
        updateGameUI().catch(err => console.error(err));
    }, intervalMs);
}

export function stopAutoRefresh() {
    if (_refreshIntervalId) {
        clearInterval(_refreshIntervalId);
        _refreshIntervalId = null;
    }
}

// =======================
// Initialisation DOM (crée le bouton dev si le DOM est prêt)
// =======================
function _createDevButton() {
    // n'ajoute pas plusieurs boutons si déjà présent
    if (document.getElementById("devForceUpdateBtn")) return;

    const devButton = document.createElement("button");
    devButton.id = "devForceUpdateBtn";
    devButton.textContent = "Force update (Dev)";
    Object.assign(devButton.style, {
        position: "fixed",
        bottom: "10px",
        right: "10px",
        zIndex: "9999",
        padding: "8px 12px",
        background: "#1e90ff",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "600"
    });
    devButton.addEventListener("click", () => {
        updateGameUI().catch(err => console.error(err));
    });
    document.body.appendChild(devButton);
}

// Lorsque le DOM est chargé, crée le bouton dev et démarre le refresh automatique
if (typeof window !== "undefined") {
    window.addEventListener("DOMContentLoaded", () => {
        try {
            _createDevButton();
            // si tu veux démarrer auto-refresh immédiatement, appelle startAutoRefresh()
            startAutoRefresh(); // intervalle par défaut = 60s
        } catch (e) {
            console.error("Erreur initialisation firebase.js:", e);
        }

        // Expose quelques utilitaires globalement pour les autres scripts (auth.js, data.js, menu.js, ...)
        window.updateGameUI = updateGameUI;
        window.startAutoRefresh = startAutoRefresh;
        window.stopAutoRefresh = stopAutoRefresh;
        window.devSkipMenu = devSkipMenu;
        window.hideMenu = hideMenu;
        window.showMenu = showMenu;
        window.fetchGameState = fetchGameState;
    }, { once: true });
}
// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
    getFirestore, doc, getDoc, updateDoc, setDoc, collection,
    writeBatch, arrayUnion, increment, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// --------- CONFIG (ta config existante) ----------
const firebaseConfig = {
    apiKey: "AIzaSyCZ0aKxn8Nxao8vlluD0nTbBssG7lzSwPo",
    authDomain: "rail-empire-b5278.firebaseapp.com",
    projectId: "rail-empire-b5278",
    storageBucket: "rail-empire-b5278.firebasestorage.app",
    messagingSenderId: "391417610159",
    appId: "1:391417610159:web:18c8ec8b692d9cbee0b95a",
    measurementId: "G-TME87RHCTC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --------- UTILITAIRES ---------
function nowMs() { return Date.now(); }
function chance(p) { return Math.random() < p; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

// récupère l'ID du joueur courant (essaye plusieurs sources)
function getCurrentPlayerId() {
    if (typeof window !== "undefined") {
        if (window.currentUser) return window.currentUser;
        const ls = localStorage.getItem('currentUser') || localStorage.getItem('pseudo');
        if (ls) return ls;
        // fallback : demander (éventuellement supprime si tu veux pas prompt)
        const ask = prompt("Entrez votre pseudo (pour chargement des données) :");
        if (ask) {
            localStorage.setItem('currentUser', ask);
            return ask;
        }
    }
    return null;
}

// --------- LOGGING LOCAL (facultatif) ----------
function pushLogLocal(progression, log) {
    if (!progression.logs) progression.logs = [];
    progression.logs.push(log);
}

// --------- PROCESSUS DES TRAINS SUR LA PÉRIODE écoulée ---------
/**
 * Applique les départs et mises à jour qui auraient dû avoir lieu entre lastUpdate et now.
 * - playerDocRef: DocumentReference (non utilisé pour écriture ici, on retourne l'objet modifié)
 * - playerData: objet récupéré depuis Firestore (doit contenir progression)
 * Retour: { updatedProgression, statsDelta, logs }
 */
async function processPlayerSince(playerData, lastUpdateMs, nowMsValue) {
    const prog = JSON.parse(JSON.stringify(playerData.progression || {})); // clone pour safety
    prog.trains = prog.trains || {};
    prog.lignes = prog.lignes || {};
    prog.logs = prog.logs || [];

    const statsDelta = {
        voyages: 0,
        passagers: 0,
        fret: 0,
        trainsPartis: 0,
        incidentsOccured: 0
    };

    // cap du nombre de minutes à traiter pour éviter freeze si joueur absent très longtemps
    const elapsedMinutes = Math.floor((nowMsValue - (lastUpdateMs || nowMsValue)) / 60000);
    const MAX_MINUTES = 60 * 24 * 30; // 30 jours en minutes -> ajustable
    const minutesToSim = Math.min(elapsedMinutes, MAX_MINUTES);

    // Pour chaque minute simulée, on fera un tirage d'incident chance selon les lignes
    // Mais pour ne pas boucler militairement toutes les minutes pour chaque train,
    // on procède par train : on calcule combien de départs se sont produits sur la période.
    for (const trainId of Object.keys(prog.trains)) {
        const train = prog.trains[trainId];
        if (!train) continue;

        // assure les champs nécessaires
        train.prochaineDepart = train.prochaineDepart || (nowMsValue + (train.intervalle || 0));
        train.intervalle = train.intervalle || (60 * 60 * 1000); // 1h par défaut

        // si prochaineDepart est dans le futur relatif au lastUpdate, on compte départs entre lastUpdate and now
        // calcule combien de départs ont eu lieu
        let departures = 0;
        if (train.prochaineDepart <= nowMsValue) {
            // nombre de départs = 1 + floor((now - prochaineDepart)/intervalle)
            const elapsedFromNext = nowMsValue - train.prochaineDepart;
            departures = 1 + Math.floor(elapsedFromNext / train.intervalle);
        }

        for (let d = 0; d < departures; d++) {
            // time of this departure:
            const departTime = train.prochaineDepart + d * train.intervalle;

            // appliquer départ
            train.enRoute = true;
            statsDelta.trainsPartis += 1;

            // capacité par défaut si non renseignée
            const capP = train.capacitePassagers ?? 0;
            const capF = train.capaciteFret ?? 0;

            // ajouter aux stats
            statsDelta.voyages += 1;
            statsDelta.passagers += capP;
            statsDelta.fret += capF;

            // log du départ
            prog.logs.push({
                type: "train_depart",
                trainId: trainId,
                ligneId: train.ligneId || null,
                ligneName: train.ligneName || null,
                timestamp: departTime,
            });

            // incidents potentiels liés à entretien
            const ligne = (prog.lignes && prog.lignes[train.ligneId]) || {};
            const niveauEntretien = clamp(ligne.niveauEntretien ?? 100, 0, 100);
            // probabilité de panne sur ce départ, proportionnelle à (100 - niveau)/100 * base
            const basePanne = 0.02; // base 2% par départ si entretien ok=0. Ajuste selon besoin
            const probaPanne = Math.max(0, (100 - niveauEntretien) / 100) * 0.5 + basePanne; // potentiellement élevé si mauvais entretien
            if (chance(probaPanne)) {
                // générer panne
                const inc = {
                    type: "panne",
                    trainId,
                    ligneId: train.ligneId || null,
                    ligneName: train.ligneName || null,
                    timestamp: departTime + 1000, // juste après le départ
                    impactMinutes: 5 + Math.floor(Math.random() * 30) // 5..35 min
                };
                prog.incidents = prog.incidents || [];
                prog.incidents.push(inc);
                prog.logs.push({ ...inc, message: "Panne matérielle générée à l'ouverture (recalc)." });
                statsDelta.incidentsOccured += 1;
                // appliquer retard au train
                train.retard = (train.retard || 0) + inc.impactMinutes;
            }

            // appliquer effets domino et distances de sécurité simplifiée :
            // si un autre train de la même ligne est en route, augmenter retard aléatoirement (simple)
            for (const otherId of Object.keys(prog.trains)) {
                if (otherId === trainId) continue;
                const o = prog.trains[otherId];
                if (o.ligneId === train.ligneId && o.enRoute) {
                    // probabilité de perturbation si plusieurs trains sur même ligne
                    if (chance(0.1)) {
                        const extra = 1 + Math.floor(Math.random() * 5);
                        o.retard = (o.retard || 0) + extra;
                        prog.logs.push({
                            type: "retard_securite",
                            trainId: otherId,
                            ligneId: o.ligneId,
                            ligneName: o.ligneName,
                            timestamp: departTime,
                            retardAdded: extra
                        });
                        statsDelta.voyages += 0; // pas de changement de voyage, juste retard
                    }
                }
            }

            // note : ne modifions pas train.prochaineDepart ici ; on fera la remise à jour après la boucle
        } // end departures loop

        // avance la prochaineDepart au prochain créneau après now
        if (departures > 0) {
            train.prochaineDepart = train.prochaineDepart + departures * train.intervalle;
        }

        // limite retards éventuels à un max raisonnable
        train.retard = clamp(train.retard || 0, 0, 24 * 60); // max 24h retard en min

        // conserve train modifié
        prog.trains[trainId] = train;
    } // end for trains

    // incidents aléatoires "en direct" sur la période entière (approche statistique):
    // on estime X incidents = minutesToSim * lambda (lambda = incidents per minute)
    // lambda peut être dérivé de l'état général d'entretien moyen
    const avgEntretien = (() => {
        const lines = Object.values(prog.lignes || {});
        if (lines.length === 0) return 100;
        const sum = lines.reduce((s, l) => s + (l.niveauEntretien ?? 100), 0);
        return sum / lines.length;
    })();
    const lambdaPerMinute = clamp((100 - avgEntretien) / 100 * 0.01, 0, 0.05); // 0..0.05 incidents/minute
    const expectedIncidents = minutesToSim * lambdaPerMinute;
    const incidentsToCreate = Math.floor(expectedIncidents + Math.random() * 2); // variation

    for (let i = 0; i < incidentsToCreate; i++) {
        // pick random line
        const lineIds = Object.keys(prog.lignes || {});
        const chosenLineId = lineIds.length ? lineIds[Math.floor(Math.random() * lineIds.length)] : null;
        const chosenLine = chosenLineId ? prog.lignes[chosenLineId] : null;
        const tstamp = nowMsValue - Math.floor(Math.random() * minutesToSim) * 60000; // somewhere in period

        const inc = {
            type: "aleatoire",
            subtype: ["météo", "signal", "panne"][Math.floor(Math.random() * 3)],
            ligneId: chosenLineId,
            ligneName: chosenLine ? chosenLine.nom : null,
            timestamp: tstamp,
            impactMinutes: 5 + Math.floor(Math.random() * 50)
        };
        prog.incidents = prog.incidents || [];
        prog.incidents.push(inc);
        prog.logs.push({ ...inc, message: "Incident aléatoire (recalc à l'ouverture)" });
        statsDelta.incidentsOccured += 1;
    }

    // timestamp de lastUpdate pour progression
    prog.lastUpdate = nowMsValue;

    return { updatedProgression: prog, statsDelta, logs: prog.logs || [] };
}

// --------- Mise à jour du joueur à l'ouverture (public) ----------
/**
 * updatePlayerOnOpen()
 * - récupère le document joueur
 * - calcule les événements manqués et incidents aléatoires
 * - écrit la progression modifiée et met à jour gameState/global (stats) atomiquement via batch
 */
export async function updatePlayerOnOpen(playerId = null) {
    try {
        const id = playerId || getCurrentPlayerId();
        if (!id) throw new Error("Aucun joueur courant trouvé (currentUser localStorage ou window.currentUser).");

        const playerRef = doc(db, "joueurs", id);
        const snap = await getDoc(playerRef);
        if (!snap.exists()) {
            console.warn("Joueur introuvable:", id);
            return null;
        }
        const playerData = snap.data();
        const prog = playerData.progression || {};
        const last = prog.lastUpdate || prog.updatedAt || playerData.lastUpdate || Date.now();
        const now = nowMs();

        // process player for period [last .. now]
        const res = await processPlayerSince(playerData, last, now);

        // prepare batch: update player's progression + append logs (we'll merge)
        // Firestore modular doesn't have arrayUnion in this import list; we'll use updateDoc with serverTimestamp and direct set merge
        // But to avoid many writes we batch:
        const batch = writeBatch(db);

        // update player progression and lastUpdate
        const newProg = res.updatedProgression;
        // ensure minimal shape
        await setDoc(playerRef, {
            progression: newProg,
            lastSynced: serverTimestamp()
        }, { merge: true });

        // update global stats (gameState/global) incrementally
        const gameRef = doc(db, "gameState", "global");
        // apply increments: voyages, passagers, fret, incidents, trainsActifs
        // Using updateDoc with increments would be ideal, but here we use set merge with increment-like behavior via update
        // modular API: use updateDoc with increment, but we didn't import increment from modular earlier? we did import increment.
        // We'll perform an update:
        await updateDoc(gameRef, {
            voyages: increment(res.statsDelta.voyages || 0),
            passagers: increment(res.statsDelta.passagers || 0),
            fretTotal: increment(res.statsDelta.fret || 0),
            incidents: increment(res.statsDelta.incidentsOccured || 0),
            trainsActifs: increment(res.statsDelta.trainsPartis || 0),
            lastUpdate: serverTimestamp()
        }).catch(async (err) => {
            // si le doc gameState/global n'existe pas, créer
            if (err && err.code === 'not-found') {
                await setDoc(gameRef, {
                    voyages: res.statsDelta.voyages || 0,
                    passagers: res.statsDelta.passagers || 0,
                    fretTotal: res.statsDelta.fret || 0,
                    incidents: res.statsDelta.incidentsOccured || 0,
                    trainsActifs: res.statsDelta.trainsPartis || 0,
                    lastUpdate: serverTimestamp()
                }, { merge: true });
            } else {
                console.error("Erreur update gameRef:", err);
            }
        });

        // Push logs array (append) - Firestore supports arrayUnion but in modular we need arrayUnion import (we did)
        if (res.logs && res.logs.length) {
            // on ajoute chaque log via update avec arrayUnion
            await updateDoc(playerRef, {
                logs: arrayUnion(...res.logs)
            }).catch(err => {
                // si logs absent ou erreur, on fait un set merge
                console.error("Erreur push logs:", err);
            });
        }

        // enfin renvoyer l'objet mis à jour (utile pour UI)
        const newSnap = await getDoc(playerRef);
        console.log("Mise à jour joueur terminée pour", id);
        return newSnap.data();
    } catch (e) {
        console.error("updatePlayerOnOpen erreur:", e);
        throw e;
    }
}

// expose globalement pour que l'UI appelle facilement
if (typeof window !== "undefined") {
    window.updatePlayerOnOpen = updatePlayerOnOpen;
    window.db = db;
}
// ===============================
// 🔧 MISE À JOUR AUTOMATIQUE DES STATISTIQUES
// ===============================

// Cette fonction s'exécute au démarrage du jeu
async function majStatistiquesAutomatiques() {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.warn("Aucun utilisateur connecté, stats non mises à jour.");
            return;
        }

        const userRef = ref(db, "joueurs/" + user.uid);
        const snapshot = await get(userRef);
        if (!snapshot.exists()) {
            console.warn("Données du joueur introuvables.");
            return;
        }

        const data = snapshot.val();
        const rames = data.rames || [];
        const trajets = data.trajets || [];
        const stats = {
            totalDistance: 0,
            totalTemps: 0,
            totalPassagers: 0,
            moyenneVitesse: 0,
            rendement: 0,
        };

        // === Calcul des stats de chaque rame ===
        const statsRames = {};
        rames.forEach((rame) => {
            const trajetsRame = trajets.filter((t) => t.idRame === rame.id);
            let distanceTotale = 0;
            let tempsTotal = 0;
            let passagersTotaux = 0;

            trajetsRame.forEach((t) => {
                distanceTotale += t.distance || 0;
                tempsTotal += t.temps || 0;
                passagersTotaux += t.passagers || 0;
            });

            const vitesseMoy = tempsTotal > 0 ? (distanceTotale / (tempsTotal / 60)) : 0;

            statsRames[rame.id] = {
                nom: rame.nom,
                distanceTotale: distanceTotale.toFixed(1),
                tempsTotal: tempsTotal.toFixed(1),
                passagersTotaux,
                vitesseMoyenne: vitesseMoy.toFixed(1),
            };

            // cumul général
            stats.totalDistance += distanceTotale;
            stats.totalTemps += tempsTotal;
            stats.totalPassagers += passagersTotaux;
        });

        // === Calcul de la moyenne globale ===
        stats.moyenneVitesse = stats.totalTemps > 0
            ? (stats.totalDistance / (stats.totalTemps / 60))
            : 0;
        stats.rendement = (stats.totalPassagers * stats.moyenneVitesse) / 1000;

        // === Enregistrement dans Firebase ===
        await update(userRef, {
            statsGlobales: stats,
            statsRames: statsRames,
            derniereMaj: new Date().toISOString(),
        });

        console.log("✅ Statistiques mises à jour avec succès !");
    } catch (err) {
        console.error("Erreur majStatistiquesAutomatiques :", err);
    }
}

// ===============================
// 🔁 MISE À JOUR À L'OUVERTURE DU JEU
// ===============================
window.addEventListener("load", () => {
    majStatistiquesAutomatiques();
});
// =======================
// INCIDENTS ET GESTION DU JEU (Temps réel Firestore)
// =======================

// Liste des incidents
const incidentsList = [
    { id: "signalisation", nom: "Panne de signalisation", type: "ralentissement", dureeMin: 60, dureeMax: 60 },
    { id: "accident_personne", nom: "Accident de personne", type: "interruption", dureeMin: 120, dureeMax: 240 },
    { id: "malaise_voyageur", nom: "Malaise voyageur", type: "ralentissement", dureeMin: 30, dureeMax: 30 },
    { id: "bagage_abandonne", nom: "Bagage abandonné", type: "interruption", dureeMin: 120, dureeMax: 120 },
    { id: "train_panne", nom: "Train en panne", type: "ralentissement", dureeMin: 60, dureeMax: 120 },
    { id: "panne_passage_niveau", nom: "Panne de passage à niveau", type: "ralentissement", dureeMin: 120, dureeMax: 120 },
    { id: "animaux_voies", nom: "Animaux sur les voies", type: "ralentissement", dureeMin: 60, dureeMax: 60 },
    { id: "defaut_alimentation", nom: "Défaut d'alimentation électrique", type: "interruption", dureeMin: 120, dureeMax: 120, electrifie: true },
    { id: "rupture_caternaire", nom: "Rupture caténaire", type: "interruption", dureeMin: 120, dureeMax: 120, electrifie: true }
];

// Probabilité d'apparition selon l'heure
function getIncidentChance() {
    const h = new Date().getHours();
    if (h >= 7 && h < 10) return 50;
    if (h >= 16 && h < 20) return 65;
    return 20;
}

// Générer un incident aléatoire
function generateIncident(isElectrified) {
    const chance = getIncidentChance();
    if (Math.random() * 100 > chance) return null; // pas d'incident

    const possibles = incidentsList.filter(i => !i.electrifie || isElectrified);
    const incident = possibles[Math.floor(Math.random() * possibles.length)];

    const duree = incident.dureeMin === incident.dureeMax
        ? incident.dureeMin
        : Math.floor(Math.random() * (incident.dureeMax - incident.dureeMin + 1)) + incident.dureeMin;

    const now = new Date().getTime();
    return {
        id: incident.id,
        nom: incident.nom,
        type: incident.type,
        debut: now,
        fin: now + duree * 60 * 1000
    };
}

// --- Gestion des trains et incidents ---
async function updateGameState() {
    const ref = db.collection("gameState").doc("global");
    const doc = await ref.get();
    let data;

    if (doc.exists) {
        data = doc.data();
    } else {
        console.log("Initialisation de l'état du jeu...");
        data = {
            fretTotal: 0,
            voyageurs: 0,
            trains: []
        };
        await ref.set(data);
    }

    const now = new Date().getTime();

    data.trains.forEach(train => {
        // Départ du train si l'heure est passée
        if (!train.depart && now >= train.heureDepart) {
            train.depart = true;
            console.log(`Train ${train.id} départ ${train.gareDepart} -> ${train.gareArrivee}`);
        }

        // Nettoyer les incidents terminés
        if (!train.incidents) train.incidents = [];
        train.incidents = train.incidents.filter(i => i.fin > now);

        // Générer nouvel incident si le train roule
        if (train.depart && train.incidents.length === 0) {
            const newIncident = generateIncident(train.electrifie);
            if (newIncident) {
                train.incidents.push(newIncident);
                console.log(`Incident sur train ${train.id} : ${newIncident.nom} (${newIncident.type})`);
            }
        }
    });

    // --- Calcul stats
    let fretTotal = 0;
    let voyageursTotal = 0;
    data.trains.forEach(train => {
        if (train.depart) {
            fretTotal += train.fret || 0;
            voyageursTotal += train.voyageurs || 0;
        }
    });
    data.fretTotal = fretTotal;
    data.voyageurs = voyageursTotal;

    // --- Sauvegarde Firestore
    await ref.set(data);
}

// --- Mise à jour toutes les minutes ---
setInterval(updateGameState, 60 * 1000);
updateGameState();

// --- Temps réel : mise à jour automatique pour tous les joueurs ---
db.collection("gameState").doc("global")
    .onSnapshot(doc => {
        if (!doc.exists) return;
        const data = doc.data();
        console.log("Stats temps réel :", data.fretTotal, data.voyageurs);
        data.trains.forEach(train => {
            console.log(`Train ${train.id} incidents actifs:`, train.incidents);
        });
    });

// --- Bouton Dev pour forcer update ---
const devButton = document.createElement("button");
devButton.textContent = "Force update (Dev)";
devButton.style.position = "fixed";
devButton.style.bottom = "10px";
devButton.style.right = "10px";
devButton.style.zIndex = "9999";
document.body.appendChild(devButton);
devButton.addEventListener("click", updateGameState);

// --- Gestion menu bloquant ---
function hideMenu() {
    const menu = document.getElementById("menu");
    if (menu) menu.style.display = "none";
}
function showMenu() {
    const menu = document.getElementById("menu");
    if (menu) menu.style.display = "block";
}

// --- Bypass Dev ---
function devSkipMenu() {
    hideMenu();
    updateGameState();
}
devSkipMenu();
/***************************************************************
 * INCIDENTS & STATS DYNAMIQUES - VERSION DÉFINITIVE
 * À coller à la fin de firebase.js
 *
 * Fonctionnalités :
 * - reprend exactement la liste d'incidents fournie
 * - combine 2 probabilités : probabilité horaire (time-of-day) et probabilité selon la durée de l'incident
 * - génération continue (tick à 1s), application d'effets sur les trains (ralentissement / interruption)
 * - stats par rame & par trajet mises à jour en continu (distance, temps, retard)
 * - UI : bandeau fixe défilant horizontal + historique vertical (code couleur par incident)
 * - exposé d'utilitaires globaux : startIncidents(), stopIncidents(), getActiveIncidents(), toggleBandeau()
 ***************************************************************/

// -----------------------------
// CONFIG : incidents fournis
// -----------------------------
const INCIDENTS = [
    { code: "signalisation", nom: "Panne de signalisation", type: "ralentissement", dureeMin: 60, dureeMax: 60, electrifie: false },
    { code: "accident_personne", nom: "Accident de personne", type: "interruption", dureeMin: 120, dureeMax: 240, electrifie: false },
    { code: "malaise_voyageur", nom: "Malaise voyageur", type: "ralentissement", dureeMin: 30, dureeMax: 30, electrifie: false },
    { code: "bagage_abandonne", nom: "Bagage abandonné", type: "interruption", dureeMin: 120, dureeMax: 120, electrifie: false },
    { code: "train_panne", nom: "Train en panne", type: "ralentissement", dureeMin: 60, dureeMax: 120, electrifie: false },
    { code: "panne_passage_niveau", nom: "Panne de passage à niveau", type: "ralentissement", dureeMin: 120, dureeMax: 120, electrifie: false },
    { code: "animaux_voies", nom: "Animaux sur les voies", type: "ralentissement", dureeMin: 60, dureeMax: 60, electrifie: false },
    { code: "defaut_alimentation", nom: "Défaut d'alimentation électrique", type: "interruption", dureeMin: 120, dureeMax: 120, electrifie: true },
    { code: "rupture_caternaire", nom: "Rupture caténaire", type: "interruption", dureeMin: 120, dureeMax: 120, electrifie: true }
];

// (optionnel) couleur et probaHeure par incident — on associe des couleurs lisibles ici
const INCIDENT_META = {
    "signalisation": { couleur: "#FFD700", probaHeure: 0.03 },
    "accident_personne": { couleur: "#8B0000", probaHeure: 0.01 },
    "malaise_voyageur": { couleur: "#66CDAA", probaHeure: 0.025 },
    "bagage_abandonne": { couleur: "#DC143C", probaHeure: 0.015 },
    "train_panne": { couleur: "#FF8C00", probaHeure: 0.02 },
    "panne_passage_niveau": { couleur: "#FF4500", probaHeure: 0.015 },
    "animaux_voies": { couleur: "#1E90FF", probaHeure: 0.04 },
    "defaut_alimentation": { couleur: "#FF6347", probaHeure: 0.02 },
    "rupture_caternaire": { couleur: "#FF0000", probaHeure: 0.015 }
};

// Merge meta into INCIDENTS (one-time)
INCIDENTS.forEach(i => {
    const m = INCIDENT_META[i.code] || {};
    i.couleur = m.couleur || "#ffffff";
    i.probaHeure = typeof m.probaHeure === "number" ? m.probaHeure : 0.02; // fallback
});

// -----------------------------
// UTILS MATH / TIME
// -----------------------------
function nowMs() { return Date.now(); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function chance(p) { return Math.random() < p; } // p in [0,1]

// Probabilité selon durée (en heures) — règles que tu as données
function probSelonDuree(dureeHeures) {
    // dureeHeures: e.g. 0.5, 1, 2, 4
    if (dureeHeures <= 1) return 0.5;
    if (dureeHeures > 1 && dureeHeures <= 2) return 0.35;
    if (Math.abs(dureeHeures - 4) < 1e-6 || dureeHeures >= 4) return 0.2;
    return 0.1;
}

// Probabilité horaire / moment de la journée (facteur multiplicatif)
function heureMultiplier() {
    const h = new Date().getHours();
    // On reprend la logique que tu avais : matinal 7-10, soir 16-20 plus de risque
    if (h >= 7 && h < 10) return 1.0 * (50 / 100); // 50% base -> multiplier 0.5
    if (h >= 16 && h < 20) return 1.0 * (65 / 100); // 0.65
    return 1.0 * (20 / 100); // 0.2
    // NOTE : on convertit ensuite de façon cohérente avec probaHeure
}

// -----------------------------
// VARIABLES D'ETAT
// -----------------------------
let incidentsActifs = []; // { code, nom, type, debutMs, finMs, dureeHours, couleur, trainId? }
let statsTrains = {};     // statsTrains[trainId][trajetId] = { distance, temps, retard }
let INCIDENTS_RUNNING = false;
let _tickHandle = null;

// -----------------------------
// UI: BANDEAU FIXE + HISTORIQUE
// -----------------------------
const _createBandeauUI = (() => {
    // create only once
    if (document.getElementById("bandeauWrapper")) return;

    const wrapper = document.createElement("div");
    wrapper.id = "bandeauWrapper";
    Object.assign(wrapper.style, {
        position: "fixed",
        bottom: "0",
        left: "0",
        width: "100%",
        background: "#222",
        color: "#fff",
        zIndex: "9999",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        boxSizing: "border-box"
    });

    // live horizontal scrolling area
    const live = document.createElement("div");
    live.id = "bandeauLive";
    Object.assign(live.style, {
        whiteSpace: "nowrap",
        overflow: "hidden",
        padding: "6px 8px",
        alignItems: "center"
    });

    const contenu = document.createElement("div");
    contenu.id = "bandeauContenu";
    Object.assign(contenu.style, {
        display: "inline-block",
        paddingLeft: "100%",
        whiteSpace: "nowrap",
        willChange: "transform"
    });

    live.appendChild(contenu);
    wrapper.appendChild(live);

    // historique vertical
    const hist = document.createElement("div");
    hist.id = "bandeauHistorique";
    Object.assign(hist.style, {
        maxHeight: "120px",
        overflowY: "auto",
        borderTop: "1px solid #555",
        padding: "4px 8px",
        background: "#161616"
    });

    wrapper.appendChild(hist);

    // small controls (hide/show, clear)
    const controls = document.createElement("div");
    controls.style.display = "flex";
    controls.style.justifyContent = "flex-end";
    controls.style.gap = "6px";
    controls.style.padding = "4px 8px 6px 8px";
    controls.style.background = "#1a1a1a";

    const btnHide = document.createElement("button");
    btnHide.textContent = "Masquer bandeau";
    Object.assign(btnHide.style, { cursor: "pointer", padding: "4px 8px", borderRadius: "4px" });
    btnHide.addEventListener("click", () => {
        wrapper.style.display = wrapper.style.display === "none" ? "flex" : "none";
    });

    const btnClear = document.createElement("button");
    btnClear.textContent = "Effacer historique";
    Object.assign(btnClear.style, { cursor: "pointer", padding: "4px 8px", borderRadius: "4px" });
    btnClear.addEventListener("click", () => {
        hist.innerHTML = "";
    });

    controls.appendChild(btnClear);
    controls.appendChild(btnHide);
    wrapper.appendChild(controls);

    document.body.appendChild(wrapper);

    // scrolling animation
    let posX = 0;
    function stepScroll() {
        const cont = document.getElementById("bandeauContenu");
        const liveEl = document.getElementById("bandeauLive");
        if (!cont || !liveEl) { requestAnimationFrame(stepScroll); return; }
        // ensure we have offsetWidth measured
        const contWidth = cont.offsetWidth || cont.scrollWidth || 1;
        const liveWidth = liveEl.offsetWidth || 1;
        posX -= 1; // pixel per frame — reasonable default
        // if content gone left pass start
        if (posX + contWidth < 0) posX = liveWidth;
        cont.style.transform = `translateX(${posX}px)`;
        requestAnimationFrame(stepScroll);
    }
    requestAnimationFrame(stepScroll);
})();

function _addToBandeau(incident) {
    const cont = document.getElementById("bandeauContenu");
    const hist = document.getElementById("bandeauHistorique");
    if (!cont || !hist) return;

    // horizontal span
    const span = document.createElement("span");
    span.textContent = `[${incident.nom}] `;
    span.style.color = incident.couleur || "#fff";
    span.style.marginRight = "28px";
    span.style.fontWeight = "600";
    cont.appendChild(span);

    // vertical history entry
    const entry = document.createElement("div");
    const t = new Date(incident.debutMs || Date.now());
    const hh = t.toLocaleTimeString();
    entry.textContent = `${hh} — ${incident.nom} (${incident.type})${incident.trainId ? " — train:" + incident.trainId : ""}`;
    entry.style.color = incident.couleur || "#fff";
    entry.style.padding = "2px 0";
    hist.appendChild(entry);
    hist.scrollTop = hist.scrollHeight;
}

// -----------------------------
// GÉNÉRATION D'INCIDENTS
// -----------------------------
// Combine : incident.probaHeure (per hour base) * heureMultiplier() * probSelonDuree(dureeHours)
// Then convert to per-second and test each tick (tickInterval ms)
function _tirerDureeMinutes(incident) {
    if (incident.dureeMin === incident.dureeMax) return incident.dureeMin;
    const min = incident.dureeMin;
    const max = incident.dureeMax;
    // inclusive integer minutes
    const diff = max - min;
    const rnd = Math.floor(Math.random() * (diff + 1));
    return min + rnd;
}

function _peutAffecterTrain(incident, train) {
    // si incident nécessite ligne électrifiée et train n'est pas sur une ligne électrifiée => ne pas affecter
    if (incident.electrifie && !train.electrifie) return false;
    return true;
}

function genererIncidentsTick() {
    // ensure trains exists
    if (typeof window !== "undefined" && typeof window.trains === "undefined") window.trains = [];
    const trainList = window.trains || [];

    // hour multiplier global
    const hourFactor = heureMultiplier(); // e.g. 0.5, 0.65, 0.2

    // for each incident type, decide whether to spawn — but apply per-train filter if needed
    INCIDENTS.forEach(incDef => {
        // choose a set of candidate trains that could be affected:
        // if incident.electrifie true -> only electrified trains
        const candidates = trainList.length ? trainList.filter(t => _peutAffecterTrain(incDef, t)) : [null]; // if no train data, allow global incidents (trainId null)

        // For each candidate train we attempt to spawn with combined probability
        candidates.forEach(train => {
            // probability base per hour defined in INCIDENT_META.probaHeure (we merged into incDef.probaHeure)
            const probaHeure = incDef.probaHeure || 0.02; // e.g. 0.02 per hour

            // determine the minute duration for this occurrence
            const dureeMin = incDef.dureeMin || incDef.duree || 60;
            const dureeMax = incDef.dureeMax || incDef.duree || dureeMin;
            const dureeMinutes = _tirerDureeMinutes({ dureeMin, dureeMax });
            const dureeHeures = dureeMinutes / 60;

            // prob selon durée (0..1)
            const pd = probSelonDuree(dureeHeures);

            // final per-second proba (approx) = probaHeure * hourFactor * pd / 3600
            // Explanation: probaHeure is base expected per hour; multiply by hourFactor (time-of-day),
            // weight by duration-probability pd, then convert to per-second by dividing by 3600.
            const perSecondProb = (probaHeure * hourFactor * pd) / 3600;

            // tick check
            if (Math.random() < perSecondProb * (tickInterval / 1000)) {
                // create incident instance
                const debut = nowMs();
                const fin = debut + Math.round(dureeMinutes * 60 * 1000);
                const instance = {
                    code: incDef.code || incDef.id || incDef.nom,
                    nom: incDef.nom,
                    type: incDef.type,
                    debutMs: debut,
                    finMs: fin,
                    dureeMinutes,
                    dureeHeures,
                    couleur: incDef.couleur || "#ffffff",
                    electrifie: !!incDef.electrifie,
                    trainId: train ? train.id : null // null means area/line/global incident
                };

                // push into active list and apply
                incidentsActifs.push(instance);
                _addToBandeau(instance);
                _appliquerIncidentSurTrain(instance, train);
                // optionally persist to Firestore / gameState global: do a batched quick update (non blocking)
                _notifierIncidentDansFirestore(instance).catch(err => {
                    // swallow errors but log in console
                    console.warn("Notif incident Firestore failed:", err);
                });
            }
        }); // end candidates
    }); // end INCIDENTS.forEach
}

// -----------------------------
// APPLICATION / RESTAURATION DES EFFETS
// -----------------------------
function _appliquerIncidentSurTrain(instance, train) {
    // If train is null => global incident (affect nothing specific, could be used for UI)
    if (!train) return;

    train.incidents = train.incidents || [];
    train.incidents.push({
        code: instance.code,
        nom: instance.nom,
        type: instance.type,
        debutMs: instance.debutMs,
        finMs: instance.finMs,
        dureeMinutes: instance.dureeMinutes
    });

    if (instance.type === "interruption") {
        // store previous speed for restoration
        train._prevVitesse = typeof train.vitesseActuelle !== "undefined" ? train.vitesseActuelle : train.vitesseMax || 0;
        train.vitesseActuelle = 0;
    } else if (instance.type === "ralentissement") {
        train._prevVitesse = typeof train.vitesseActuelle !== "undefined" ? train.vitesseActuelle : train.vitesseMax || 0;
        // apply a sensible slowdown: 50% of current or if not set then 50% of vmax
        const base = train.vitesseActuelle || train.vitesseMax || 0;
        train.vitesseActuelle = base * 0.5;
    }

    // log local train property for visibility
    if (!train._incidentLog) train._incidentLog = [];
    train._incidentLog.push({ code: instance.code, at: instance.debutMs });
}

// restore when incident expired
function _restaurerEffetsIncident(instance) {
    // If it targeted a train, restore train speeds
    if (!instance.trainId) return;

    const trainList = window.trains || [];
    const train = trainList.find(t => t.id === instance.trainId);
    if (!train) return;

    // remove from train.incidents
    if (train.incidents) {
        train.incidents = train.incidents.filter(i => !(i.code === instance.code && i.debutMs === instance.debutMs));
    }

    // try to restore previous speed field if present
    if (typeof train._prevVitesse !== "undefined") {
        train.vitesseActuelle = train._prevVitesse;
        delete train._prevVitesse;
    } else {
        // fallback to vitesseMax if exists
        if (train.vitesseMax) train.vitesseActuelle = train.vitesseMax;
    }

    // log restore
    if (!train._incidentLog) train._incidentLog = [];
    train._incidentLog.push({ restored: instance.code, at: nowMs() });
}

// -----------------------------
// NETTOYAGE D'INCIDENTS EXPIRÉS
// -----------------------------
function nettoyerIncidentsExpirés() {
    const now = nowMs();
    const expirés = incidentsActifs.filter(i => i.finMs <= now);
    if (expirés.length === 0) return;

    expirés.forEach(inst => {
        _restaurerEffetsIncident(inst);
        // optionally notify Firestore that incident ended
        _notifierFinIncidentDansFirestore(inst).catch(err => {
            console.warn("Erreur notify end incident:", err);
        });
    });

    // keep only non-expired
    incidentsActifs = incidentsActifs.filter(i => i.finMs > now);
}

// -----------------------------
// STATS DYNAMIQUES (par rame & trajet)
// -----------------------------
function mettreAJourStatsDynamiques() {
    // ensure trains exists
    if (typeof window !== "undefined" && typeof window.trains === "undefined") window.trains = [];
    const trainList = window.trains || [];

    trainList.forEach(t => {
        if (!t.id) return; // skip malformed
        if (!statsTrains[t.id]) statsTrains[t.id] = {};

        const trajetId = t.trajetId || "default";
        if (!statsTrains[t.id][trajetId]) statsTrains[t.id][trajetId] = { distanceKm: 0, tempsSec: 0, retardSec: 0 };

        const st = statsTrains[t.id][trajetId];

        // assume vitesseActuelle in km/h; tickInterval in ms -> km this tick = v*(dt_seconds)/3600
        const v = typeof t.vitesseActuelle === "number" ? t.vitesseActuelle : (t.vitesseMax || 0);
        const dtSec = tickInterval / 1000;
        const deltaKm = (v * dtSec) / 3600.0;

        // careful arithmetic digit-by-digit (simple, explicit)
        // accumulate distance
        st.distanceKm = st.distanceKm + deltaKm;
        // accumulate time
        st.tempsSec = st.tempsSec + dtSec;

        // compute retard: we use (vitesseMax - vitesseActuelle) averaged as seconds of delay proxy
        const vmax = t.vitesseMax || v;
        const retardIncrement = Math.max(0, vmax - v) * (dtSec / (vmax || 1)); // in seconds-ish, scaled
        st.retardSec = st.retardSec + retardIncrement;
    });
}

// -----------------------------
// FIRESTORE NOTIFICATIONS (optionnelles, non-blocking)
// -----------------------------
// These functions try to append incidents to gameState/global or to a collection "incidents".
// They use modular Firestore helpers present in your file (updateDoc, doc, arrayUnion, setDoc).
// They return Promises and errors are logged but do not stop game loop.

async function _notifierIncidentDansFirestore(instance) {
    try {
        if (typeof db === "undefined" || typeof updateDoc === "undefined" || typeof doc === "undefined") return;
        const gameRef = typeof doc === "function" ? doc(db, "gameState", "global") : null;
        if (!gameRef) return;

        // Append incident summary to an array "incidentsLog" using arrayUnion if available
        if (typeof arrayUnion !== "undefined") {
            await updateDoc(gameRef, {
                incidentsLog: arrayUnion({
                    code: instance.code,
                    nom: instance.nom,
                    type: instance.type,
                    debut: new Date(instance.debutMs).toISOString(),
                    fin: new Date(instance.finMs).toISOString(),
                    trainId: instance.trainId || null
                })
            }).catch(async err => {
                // if not-found or missing field, try set merge
                try {
                    await setDoc(gameRef, {
                        incidentsLog: [{
                            code: instance.code,
                            nom: instance.nom,
                            type: instance.type,
                            debut: new Date(instance.debutMs).toISOString(),
                            fin: new Date(instance.finMs).toISOString(),
                            trainId: instance.trainId || null
                        }]
                    }, { merge: true });
                } catch (e) {
                    console.warn("Echec setDoc incidentsLog:", e);
                }
            });
        }
    } catch (e) {
        console.warn("notif incident firestore error", e);
    }
}

async function _notifierFinIncidentDansFirestore(instance) {
    try {
        if (typeof db === "undefined" || typeof updateDoc === "undefined" || typeof doc === "undefined") return;
        const gameRef = typeof doc === "function" ? doc(db, "gameState", "global") : null;
        if (!gameRef) return;

        // push an end-marker to incidentsLog
        if (typeof arrayUnion !== "undefined") {
            await updateDoc(gameRef, {
                incidentsLog: arrayUnion({
                    code: instance.code,
                    nom: instance.nom,
                    type: instance.type,
                    ended: new Date().toISOString(),
                    trainId: instance.trainId || null
                })
            }).catch(() => { });
        }
    } catch (e) {
        console.warn("notif fin incident firestore error", e);
    }
}

// -----------------------------
// BOUCLE PRINCIPALE / START / STOP
// -----------------------------
const tickInterval = 1000; // 1s tick as requested (H24 continuous)

// one tick does: generate candidates, clean expired, apply stats update
function _tickFunction() {
    try {
        genererIncidentsTick();
        nettoyerIncidentsExpirés();
        mettreAJourStatsDynamiques();
    } catch (err) {
        console.error("Erreur tick incidents:", err);
    }
}

function startIncidents() {
    if (INCIDENTS_RUNNING) return;
    INCIDENTS_RUNNING = true;
    // ensure UI created
    _createBandeauUI();
    // start loop
    _tickHandle = setInterval(_tickFunction, tickInterval);
    // run one immediate tick
    _tickFunction();
    console.log("Incidents engine démarré.");
}

function stopIncidents() {
    if (!INCIDENTS_RUNNING) return;
    INCIDENTS_RUNNING = false;
    if (_tickHandle) clearInterval(_tickHandle);
    _tickHandle = null;
    console.log("Incidents engine arrêté.");
}

function getActiveIncidents() {
    // return a shallow copy
    return incidentsActifs.slice();
}

function clearAllIncidents() {
    // restore trains speeds for all active incidents and clear list
    incidentsActifs.forEach(i => _restaurerEffetsIncident(i));
    incidentsActifs = [];
    const hist = document.getElementById("bandeauHistorique");
    const cont = document.getElementById("bandeauContenu");
    if (hist) hist.innerHTML = "";
    if (cont) cont.innerHTML = "";
    console.log("Tous les incidents ont été nettoyés.");
}

// toggle bandeau visibility
function toggleBandeau() {
    const wrapper = document.getElementById("bandeauWrapper");
    if (!wrapper) return;
    wrapper.style.display = wrapper.style.display === "none" ? "flex" : "none";
}

// expose to global scope for console / other scripts
if (typeof window !== "undefined") {
    window.startIncidents = startIncidents;
    window.stopIncidents = stopIncidents;
    window.getActiveIncidents = getActiveIncidents;
    window.clearAllIncidents = clearAllIncidents;
    window.toggleBandeau = toggleBandeau;
    window._incidentsEngine = {
        INCIDENTS,
        incidentsActifs,
        statsTrains
    };
}

// auto-start by default (comment out if you prefer manual start)
try {
    // start automatically only if not already running
    if (!INCIDENTS_RUNNING) startIncidents();
} catch (e) {
    console.warn("Impossible de démarrer automatiquement le moteur d'incidents:", e);
}
// ----- LOGIQUE INCIDENTS -----
function genererIncident() {
    INCIDENTS.forEach(incident => {
        const proba = getProba(incident.duree);
        if (Math.random() < proba) {
            const debut = Date.now();
            const fin = debut + incident.duree * 3600 * 1000; // durée en ms
            const nouvelIncident = { ...incident, debut, fin };

            // Ajout à la liste active
            incidentsActifs.push(nouvelIncident);

            // --- AFFICHAGE DANS L'UI SUIVITRAIN.HTML ---
            if (window._pushIncidentToUI) {
                window._pushIncidentToUI(nouvelIncident);
            }

            // Application sur les trains
            appliquerIncident(nouvelIncident);
        }
    });
}
if (window._updateStatsFromFirebase) {
    window._updateStatsFromFirebase(statsTrains);
}
/***********************
 *  GESTION TRAVAUX FERROVIAIRES – VERSION LIVE COMPLETE
 *  À coller à la fin de firebase.js
 ***********************/

// ----- CONFIG CHANTIERS -----
const CHANTIERS = [
    { code: "CH_TRAVAUX", nom: "Travaux ferroviaires", dureeMin: 1, dureeMax: 3, type: "ralentissement", couleur: "#FF8C00" }
];

// Probabilité d'apparition selon heure (peut être modifiée)
function probaChantier() {
    const h = new Date().getHours();
    if (h >= 7 && h < 10) return 0.3;
    if (h >= 16 && h < 20) return 0.4;
    return 0.1;
}

// Proba de toucher 2 voies selon ligne (exemple : lignes électrifiées plus sensibles)
function probaDeuxVoies(ligneElectrifiee) {
    return ligneElectrifiee ? 0.6 : 0.4; // 60% si électrifiée, 40% sinon
}

// ----- VARIABLES -----
let chantiersActifs = [];

// ----- GENERATION DES CHANTIERS -----
function genererChantier() {
    lignes.forEach(ligne => {
        if (Math.random() < probaChantier()) {
            const chantierType = CHANTIERS[0]; // Pour l'instant un seul type
            const duree = chantierType.dureeMin + Math.floor(Math.random() * (chantierType.dureeMax - chantierType.dureeMin + 1));
            const nbVoies = Math.random() < probaDeuxVoies(ligne.electrifiee) ? 2 : 1;
            const nouveauChantier = {
                ...chantierType,
                ligneId: ligne.id,
                debut: Date.now(),
                fin: Date.now() + duree * 3600 * 1000,
                nbVoies
            };
            chantiersActifs.push(nouveauChantier);
            appliquerChantier(nouveauChantier);
            afficherChantierLive(nouveauChantier);
        }
    });
}

// ----- APPLICATION SUR TRAINS -----
function appliquerChantier(chantier) {
    trains.forEach(train => {
        if (train.ligneId === chantier.ligneId) {
            if (!train.chantiers) train.chantiers = [];
            train.chantiers.push(chantier);
            // Application de l'effet
            if (chantier.type === "interruption") train.vitesseActuelle = 0;
            if (chantier.type === "ralentissement") train.vitesseActuelle *= 0.5;
        }
    });
}

// ----- NETTOYAGE CHANTIERS EXPIRÉS -----
function nettoyerChantiers() {
    const maintenant = Date.now();
    chantiersActifs = chantiersActifs.filter(chantier => {
        if (chantier.fin <= maintenant) {
            trains.forEach(train => {
                if (train.chantiers) {
                    train.chantiers = train.chantiers.filter(c => c.code !== chantier.code || c.ligneId !== chantier.ligneId);
                    train.vitesseActuelle = train.vitesseMax; // reset simple
                }
            });
            return false;
        }
        return true;
    });
}

// ----- AFFICHAGE CHANTIERS -----
function afficherChantierLive(chantier) {
    // bandeau horizontal
    const span = document.createElement("span");
    span.textContent = `[${chantier.nom} sur ligne ${chantier.ligneId} (${chantier.nbVoies} voie${chantier.nbVoies > 1 ? 's' : ''})] `;
    span.style.color = chantier.couleur;
    span.style.marginRight = "20px";
    bandeauContenu.appendChild(span);

    // historique vertical
    const histSpan = document.createElement("div");
    const date = new Date();
    histSpan.textContent = `${date.toLocaleTimeString()} - ${chantier.nom} sur ligne ${chantier.ligneId} (${chantier.nbVoies} voie${chantier.nbVoies > 1 ? 's' : ''})`;
    histSpan.style.color = chantier.couleur;
    historiqueWrapper.appendChild(histSpan);
    historiqueWrapper.scrollTop = historiqueWrapper.scrollHeight;
}

// ----- BOUCLE PRINCIPALE CHANTIERS -----
setInterval(() => {
    genererChantier();
    nettoyerChantiers();
}, tickInterval);
/***********************
 *  GESTION EVENEMENTS DYNAMIQUES (INCIDENTS + CHANTIERS)
 *  Bandeau live + historique unique
 ***********************/

// On combine incidents et chantiers dans un seul tableau pour affichage
function afficherEvenementLive(evenement) {
    const nom = evenement.nom;
    const couleur = evenement.couleur || "#FFFFFF";
    const type = evenement.type;
    const details = evenement.ligneId ? ` sur ligne ${evenement.ligneId}${evenement.nbVoies ? ' (' + evenement.nbVoies + ' voie' + (evenement.nbVoies > 1 ? 's' : '') + ')' : ''}` : '';

    // bandeau horizontal
    const span = document.createElement("span");
    span.textContent = `[${nom}${details}] `;
    span.style.color = couleur;
    span.style.marginRight = "20px";
    bandeauContenu.appendChild(span);

    // historique vertical
    const histSpan = document.createElement("div");
    const date = new Date();
    histSpan.textContent = `${date.toLocaleTimeString()} - ${nom}${details} (${type})`;
    histSpan.style.color = couleur;
    historiqueWrapper.appendChild(histSpan);
    historiqueWrapper.scrollTop = historiqueWrapper.scrollHeight;
}

// ---- GENERATION ET APPLICATION -----
function genererEvenements() {
    // incidents
    INCIDENTS.forEach(incident => {
        const proba = getProba(incident.duree);
        if (Math.random() < proba) {
            const duree = incident.duree || (incident.dureeMin + Math.floor(Math.random() * (incident.dureeMax - incident.dureeMin + 1)));
            const nouvelIncident = { ...incident, debut: Date.now(), fin: Date.now() + duree * 3600 * 1000 };
            incidentsActifs.push(nouvelIncident);
            appliquerIncident(nouvelIncident);
            afficherEvenementLive(nouvelIncident);
        }
    });

    // chantiers
    lignes.forEach(ligne => {
        if (Math.random() < probaChantier()) {
            const chantierType = CHANTIERS[0];
            const duree = chantierType.dureeMin + Math.floor(Math.random() * (chantierType.dureeMax - chantierType.dureeMin + 1));
            const nbVoies = Math.random() < probaDeuxVoies(ligne.electrifiee) ? 2 : 1;
            const nouveauChantier = {
                ...chantierType,
                ligneId: ligne.id,
                debut: Date.now(),
                fin: Date.now() + duree * 3600 * 1000,
                nbVoies
            };
            chantiersActifs.push(nouveauChantier);
            appliquerChantier(nouveauChantier);
            afficherEvenementLive(nouveauChantier);
        }
    });
}

// ---- NETTOYAGE EVENEMENTS -----
function nettoyerEvenements() {
    const maintenant = Date.now();

    // incidents
    incidentsActifs = incidentsActifs.filter(incident => {
        if (incident.fin <= maintenant) {
            trains.forEach(train => {
                if (train.incidents) {
                    train.incidents = train.incidents.filter(i => i.code !== incident.code);
                    train.vitesseActuelle = train.vitesseMax;
                }
            });
            return false;
        }
        return true;
    });

    // chantiers
    chantiersActifs = chantiersActifs.filter(chantier => {
        if (chantier.fin <= maintenant) {
            trains.forEach(train => {
                if (train.chantiers) {
                    train.chantiers = train.chantiers.filter(c => c.code !== chantier.code || c.ligneId !== chantier.ligneId);
                    train.vitesseActuelle = train.vitesseMax;
                }
            });
            return false;
        }
        return true;
    });
}

// ---- BOUCLE PRINCIPALE -----
setInterval(() => {
    genererEvenements();
    nettoyerEvenements();
    mettreAJourStats();
}, tickInterval);
function afficherEvenementLive(evenement) {
    const nom = evenement.nom;
    const couleur = evenement.couleur || "#FFFFFF";
    const typeClasse = evenement.type ? `type-${evenement.type}` : "type-chantier";
    const icClasse = evenement.type && evenement.type !== "chantier" ? "icIncident" : "icChantier";
    const details = evenement.ligneId ? ` sur ligne ${evenement.ligneId}${evenement.nbVoies ? ' (' + evenement.nbVoies + ' voie' + (evenement.nbVoies > 1 ? 's' : '') + ')' : ''}` : '';

    // bandeau horizontal
    const span = document.createElement("span");
    span.textContent = `[${nom}${details}] `;
    span.style.color = couleur;
    span.style.marginRight = "20px";
    bandeauContenu.appendChild(span);

    // historique vertical
    const histSpan = document.createElement("div");
    histSpan.textContent = `${new Date().toLocaleTimeString()} - ${nom}${details}`;
    histSpan.className = `histEvenement ${icClasse} ${typeClasse}`;
    histSpan.style.color = couleur;
    historiqueWrapper.appendChild(histSpan);
    historiqueWrapper.scrollTop = historiqueWrapper.scrollHeight;
}
