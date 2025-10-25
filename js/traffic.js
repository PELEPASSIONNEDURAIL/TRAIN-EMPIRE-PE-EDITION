// ===================== TRAFFIC.JS =====================
// Gestion des circulations des trains dans TRAIN EMPIRE PE EDITION

const Traffic = (() => {

    // ===================== CONSTANTES =====================
    const MAX_SPEED_KMH = 300; // valeur par défaut si non définie
    const SECTION_TIME_STEP = 1; // minute pour simulation
    const TRAIN_LENGTH_MAX = 750; // mètres

    // ===================== VARIABLES =====================
    let trains = Storage.loadTrajets(); // listes des trajets en cours
    let rames = Storage.loadRames();
    let lignes = Storage.loadLignes();

    // ===================== UTILITAIRES =====================
    function getRameByName(name) {
        return rames.find(r => r.nom === name);
    }

    function getLigne(dep, arr, via = '') {
        return lignes.find(l => l.depart === dep && l.arrivee === arr && l.note === via);
    }

    function kmhToMPerMin(v) {
        return v * 1000 / 60;
    }

    // ===================== CALCUL VITESSE & RETARD =====================
    function calculateSectionTime(dep, arr, rame, via = '') {
        const ligne = getLigne(dep, arr, via);
        if (!ligne) return null;

        const vmaxRame = rame.vmax || MAX_SPEED_KMH;
        const vitesseSection = Math.min(vmaxRame, ligne.vitesse);
        const distance = ligne.distance; // km
        const temps = distance / vitesseSection * 60; // minutes
        return temps;
    }

    function calculateTrainSchedule(train) {
        const rame = getRameByName(train.nomRame);
        if (!rame) return null;

        let horaires = [];
        let currentTime = App.parseTime(train.heureDepart);

        const dep = train.gareDepart;
        const arr = train.gareArrivee;
        const via = train.via || '';

        // Vérifie les incidents
        const impact = Incidents.checkTrainImpact({ gareActuelle: dep, prochaineGare: arr });
        let retard = impact.retard || 0;

        const tempsSection = calculateSectionTime(dep, arr, rame, via);
        if (!tempsSection) return null;

        currentTime.setMinutes(currentTime.getMinutes() + Math.round(tempsSection + retard));

        horaires.push({
            gareDepart: dep,
            heureDepart: train.heureDepart,
            gareArrivee: arr,
            heureArrivee: App.formatTime(currentTime),
            retard: retard,
            action: impact.action,
            incidents: impact.details
        });

        return horaires;
    }

    // ===================== SIMULATION =====================
    function simulateAllTrains() {
        trains = Storage.loadTrajets();
        rames = Storage.loadRames();
        lignes = Storage.loadLignes();

        trains.forEach(train => {
            const schedule = calculateTrainSchedule(train);
            train.schedule = schedule;
        });

        Storage.saveTrajets(trains);
    }

    // ===================== GESTION PRIORITÉ =====================
    function sortTrainsByPriority(trainsList) {
        // Priorité aux trains voyageur sur fret
        return trainsList.sort((a, b) => {
            const typeA = a.type === 'voyageur' ? 1 : 0;
            const typeB = b.type === 'voyageur' ? 1 : 0;
            return typeB - typeA; // voyageur avant fret
        });
    }

    // ===================== AFFICHAGE =====================
    function renderTrain(train, container) {
        if (!train.schedule) return;

        container.innerHTML = ''; // reset
        train.schedule.forEach(s => {
            const div = document.createElement('div');
            div.className = 'train-line';
            div.innerHTML = `
          <div class="train-rame">${train.nomRame}</div>
          <div class="train-info">
            ${s.gareDepart} ${s.heureDepart} → ${s.gareArrivee} ${s.heureArrivee}
            ${s.retard > 0 ? `<span class="retard">+${s.retard}min</span>` : ''}
            ${s.action !== 'aucun' ? `<span class="action">${s.action}</span>` : ''}
          </div>
        `;
            container.appendChild(div);
        });
    }

    // ===================== PUBLIC =====================
    return {
        simulateAllTrains,
        calculateTrainSchedule,
        sortTrainsByPriority,
        renderTrain
    };

})();
