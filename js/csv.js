// ===================== CSV.JS =====================
// Gestion des imports/exports CSV pour lignes, trajets et rames

const CSV = (() => {

    // Convertit un tableau d'objets en CSV
    function exportCSV(data, headers = []) {
        if (!data || !data.length) return '';

        const keys = headers.length ? headers : Object.keys(data[0]);
        const csvRows = [];

        // Ajouter l'entête
        csvRows.push(keys.join(','));

        // Ajouter les lignes
        data.forEach(item => {
            const row = keys.map(key => {
                let val = item[key] !== undefined ? item[key] : '';
                // Échapper les valeurs contenant des virgules
                if (typeof val === 'string' && val.includes(',')) {
                    val = `"${val}"`;
                }
                return val;
            });
            csvRows.push(row.join(','));
        });

        return csvRows.join('\n');
    }

    // Télécharge un CSV depuis un tableau d'objets
    function downloadCSV(data, filename = 'export.csv', headers = []) {
        const csvContent = exportCSV(data, headers);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Lit un fichier CSV et le transforme en tableau d'objets
    function importCSV(file, callback) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const rows = text.split(/\r?\n/).filter(r => r.trim() !== '');
            if (!rows.length) return callback([]);

            // Première ligne = headers
            const headers = rows[0].split(',').map(h => h.trim());
            const data = [];

            for (let i = 1; i < rows.length; i++) {
                const cols = rows[i].split(',').map(c => c.trim());
                if (cols.length !== headers.length) continue;

                const obj = {};
                headers.forEach((h, idx) => {
                    obj[h] = cols[idx];
                });
                data.push(obj);
            }

            callback(data);
        };
        reader.readAsText(file);
    }

    // Parse CSV depuis une chaîne (utile pour tests ou data en string)
    function parseCSVString(csvString) {
        const rows = csvString.split(/\r?\n/).filter(r => r.trim() !== '');
        if (!rows.length) return [];

        const headers = rows[0].split(',').map(h => h.trim());
        const data = [];

        for (let i = 1; i < rows.length; i++) {
            const cols = rows[i].split(',').map(c => c.trim());
            if (cols.length !== headers.length) continue;

            const obj = {};
            headers.forEach((h, idx) => {
                obj[h] = cols[idx];
            });
            data.push(obj);
        }

        return data;
    }

    return {
        exportCSV,
        downloadCSV,
        importCSV,
        parseCSVString
    };

})();
