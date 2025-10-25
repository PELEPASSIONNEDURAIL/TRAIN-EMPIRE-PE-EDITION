// ===================== LIGNE.JS =====================
// Gestion création, import et stockage des lignes

document.addEventListener('DOMContentLoaded', () => {
    const ligneForm = document.getElementById('ligne-form');
    const listContainer = document.getElementById('list-container');
    const importCSVInput = document.getElementById('import-ligne-csv');
    const resetButton = document.getElementById('reset-ligne');

    let lignes = JSON.parse(localStorage.getItem('lignes')) || [];

    // Affiche toutes les lignes en mémoire
    function renderLignes() {
        listContainer.innerHTML = '';
        lignes.forEach((ligne, index) => {
            const div = document.createElement('div');
            div.classList.add('ligne-item');
            div.innerHTML = `
          <strong>${ligne.depart} → ${ligne.arrivee}</strong> |
          Distance : ${ligne.distance} km |
          Vitesse : ${ligne.vitesse} km/h |
          Électrifié : ${ligne.electrifie ? 'Oui' : 'Non'} |
          Thermique : ${ligne.thermique ? 'Oui' : 'Non'} |
          Note : ${ligne.note || '-'}
        `;
            listContainer.appendChild(div);
        });
    }

    // Sauvegarde dans localStorage
    function saveLignes() {
        localStorage.setItem('lignes', JSON.stringify(lignes));
    }

    // Ajouter une ligne depuis le formulaire
    ligneForm.addEventListener('submit', e => {
        e.preventDefault();

        const newLigne = {
            depart: document.getElementById('gare-depart').value.trim(),
            arrivee: document.getElementById('gare-arrivee').value.trim(),
            distance: parseFloat(document.getElementById('distance').value),
            vitesse: parseFloat(document.getElementById('vitesse').value),
            electrifie: document.getElementById('electrifie').checked,
            thermique: document.getElementById('thermique').checked,
            note: document.getElementById('note').value.trim()
        };

        lignes.push(newLigne);
        saveLignes();
        renderLignes();
        ligneForm.reset();
    });

    // Reset des lignes en mémoire
    resetButton.addEventListener('click', () => {
        if (confirm("Voulez-vous vraiment effacer toutes les lignes ?")) {
            lignes = [];
            saveLignes();
            renderLignes();
        }
    });

    // Import CSV
    importCSVInput.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = event => {
            const text = event.target.result;
            const rows = text.split(/\r?\n/);

            rows.forEach(row => {
                if (!row.trim()) return; // ignore les lignes vides
                const cols = row.split(',');
                if (cols.length < 7) return; // ignore si pas assez de colonnes

                const ligne = {
                    depart: cols[0].trim(),
                    arrivee: cols[1].trim(),
                    distance: parseFloat(cols[2]),
                    vitesse: parseFloat(cols[3]),
                    electrifie: cols[4].trim().toLowerCase() === 'oui',
                    thermique: cols[5].trim().toLowerCase() === 'oui',
                    note: cols[6].trim()
                };

                lignes.push(ligne);
            });

            saveLignes();
            renderLignes();
            importCSVInput.value = ''; // reset input
        };
        reader.readAsText(file);
    });

    // Initial render
    renderLignes();
});
