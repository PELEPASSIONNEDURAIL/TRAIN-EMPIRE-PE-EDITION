// ===================== INCIDENTS.JS =====================
// Gestion des perturbations sur le réseau

const Incidents = (() => {

    // Liste des types d’incidents avec leur impact
    const INCIDENT_TYPES = [
        { type: "panne_signalisation", nom: "Panne de signalisation", duree: [30, 60], effet: "ralentissement" },
        { type: "malaise_voyageur", nom: "Malaise voyageur", duree: [60, 60], effet: "ralentissement" },
        { type: "bagage_oublie", nom: "Bagage oublié", duree: [60, 120], effet: "interruption" },
        { type: "accident_personne", nom: "Accident de personne", duree: [120, 240], effet: "interruption" },
        { type: "train_en_panne", nom: "Train en panne", duree: [60, 60], effet: "ralentissement" },
        { type: "defaut_alimentation", nom: "Défaut d'alimentation électrique", duree: [120, 120], effet: "interruption" },
        { type: "panne_infra", nom: "Panne sur les installations du gestionnaire", duree: [60, 60], effet: "ralentissement" },
        { type: "incident_voie", nom: "Incident voie", duree: [60, 60], effet: "interruption" },
        { type: "panne_pn", nom: "Panne passage à niveau", duree: [30, 30], effet: "arrêt+ralentissement" }
    ];

    // Liste dynamique des incidents en cours
    let incidents = JSON.parse(localStorage.getItem('incidents')) || [];

    // Génère un nouvel incident
    function addIncident(type, gare, startTime = new Date()) {
        const info = INCIDENT_TYPES.find(i => i.type === type);
        if (!info) return;

        const dureeMin = info.duree[0];
        const dureeMax = info.duree[1];
        const duree = Math.floor(Math.random() * (dureeMax - dureeMin + 1)) + dureeMin; // en minutes

        const incident = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            type: info.type,
            nom: info.nom,
            gare: gare,
            startTime: startTime.getTime(),
            duree: duree, // minutes
            effet: info.effet
        };

        incidents.push(incident);
        saveIncidents();
    }

    // Supprime un incident terminé
    function cleanIncidents() {
        const now = Date.now();
        incidents = incidents.filter(i => now < i.startTime + i.duree * 60 * 1000);
        saveIncidents();
    }

    // Récupère les incidents en cours pour une gare
    function getIncidentsByGare(gare) {
        cleanIncidents();
        return incidents.filter(i => i.gare === gare);
    }

    // Récupère tous les incidents en cours
    function getAllIncidents() {
        cleanIncidents();
        return incidents;
    }

    // Supprime tous les incidents
    function resetIncidents() {
        incidents = [];
        saveIncidents();
    }

    // Sauvegarde dans localStorage
    function saveIncidents() {
        localStorage.setItem('incidents', JSON.stringify(incidents));
    }

    // Vérifie si un train est impacté par un incident
    // train = { gareActuelle, prochaineGare }
    function checkTrainImpact(train) {
        cleanIncidents();
        const gare = train.prochaineGare;
        const impact = getIncidentsByGare(gare);
        let retard = 0;
        let action = 'aucun';

        impact.forEach(i => {
            if (i.effet === 'ralentissement') retard += 30; // exemple simplifié
            if (i.effet === 'interruption') action = 'arret';
            if (i.effet === 'arrêt+ralentissement') action = 'arret';
        });

        return { retard, action, details: impact };
    }

    return {
        addIncident,
        getIncidentsByGare,
        getAllIncidents,
        resetIncidents,
        checkTrainImpact
    };

})();
