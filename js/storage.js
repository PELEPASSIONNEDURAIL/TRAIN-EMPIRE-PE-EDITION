// ===================== STORAGE.JS =====================
// Gestion des sauvegardes illimitées pour TRAIN EMPIRE PE EDITION

const Storage = (() => {

    // Préfixe pour éviter conflits
    const PREFIX = 'TEPE_';

    // ===================== LOCAL STORAGE =====================
    function save(key, data) {
        try {
            localStorage.setItem(PREFIX + key, JSON.stringify(data));
        } catch (e) {
            console.error('Erreur sauvegarde localStorage:', e);
        }
    }

    function load(key, defaultValue = null) {
        const data = localStorage.getItem(PREFIX + key);
        if (!data) return defaultValue;
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error('Erreur lecture localStorage:', e);
            return defaultValue;
        }
    }

    function remove(key) {
        localStorage.removeItem(PREFIX + key);
    }

    function clearAll() {
        Object.keys(localStorage).forEach(k => {
            if (k.startsWith(PREFIX)) localStorage.removeItem(k);
        });
    }

    // ===================== RAMES =====================
    function saveRames(rames) {
        save('rames', rames);
    }

    function loadRames() {
        return load('rames', []);
    }

    // ===================== TRAJETS =====================
    function saveTrajets(trajets) {
        save('trajets', trajets);
    }

    function loadTrajets() {
        return load('trajets', []);
    }

    // ===================== LIGNES =====================
    function saveLignes(lignes) {
        save('lignes', lignes);
    }

    function loadLignes() {
        return load('lignes', []);
    }

    // ===================== EXPORT/IMPORT JSON =====================
    function exportJSON(data, filename = 'export.json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function importJSON(file, callback) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                callback(data);
            } catch (err) {
                console.error('Erreur import JSON:', err);
                callback(null);
            }
        };
        reader.readAsText(file);
    }

    // ===================== EXPORT/IMPORT CSV =====================
    function exportCSV(data, headers = [], filename = 'export.csv') {
        CSV.downloadCSV(data, filename, headers);
    }

    function importCSV(file, callback) {
        CSV.importCSV(file, callback);
    }

    // ===================== PUBLIC =====================
    return {
        save,
        load,
        remove,
        clearAll,
        saveRames,
        loadRames,
        saveTrajets,
        loadTrajets,
        saveLignes,
        loadLignes,
        exportJSON,
        importJSON,
        exportCSV,
        importCSV
    };

})();
