// ===================== TRAJET.JS =====================
// Gestion création / édition / sauvegarde des trajets
// TRAIN EMPIRE PE EDITION

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("trajet-form");
    const listContainer = document.getElementById("list-container");
    const resetBtn = document.getElementById("reset-trajet");
    const importCsvInput = document.getElementById("import-trajet-csv");

    let trajets = JSON.parse(localStorage.getItem("trajets") || "[]");

    // ===================== AFFICHAGE =====================
    function displayTrajets() {
        listContainer.innerHTML = "";
        trajets.forEach((t, idx) => {
            const div = document.createElement("div");
            div.classList.add("trajet-item");

            const dep = t.heureDepart || "-";
            const arr = t.heureArrivee || "-";
            let retardText = t.retard ? ` (Retard: ${t.retard} min)` : "";

            div.innerHTML = `
          <strong>${t.nom}</strong> – ${t.gareDepart} ${dep} → ${t.gareArrivee} ${arr}${retardText} [${t.type}]
        `;

            listContainer.appendChild(div);
        });
    }

    displayTrajets();

    // ===================== FORM AJOUT / SAUVEGARDE =====================
    form.addEventListener("submit", e => {
        e.preventDefault();

        const newTrajet = {
            id: Date.now(),
            nom: document.getElementById("trajet-nom").value,
            gareDepart: document.getElementById("gare-depart").value,
            heureDepart: document.getElementById("heure-depart").value,
            gareArrivee: document.getElementById("gare-arrivee").value,
            heureArrivee: document.getElementById("heure-arrivee").value,
            arret: document.getElementById("trajet-arret").value,
            passage: document.getElementById("trajet-passage").value,
            type: document.getElementById("trajet-type").value,
            retard: 0 // par défaut
        };

        trajets.push(newTrajet);
        localStorage.setItem("trajets", JSON.stringify(trajets));
        displayTrajets();
        form.reset();
    });

    // ===================== RESET =====================
    resetBtn.addEventListener("click", () => {
        form.reset();
    });

    // ===================== IMPORT CSV =====================
    importCsvInput.addEventListener("change", e => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (evt) {
            const csvText = evt.target.result;
            const imported = CSV.parse(csvText); // à définir dans csv.js
            // Structure CSV attendue : Nom rame / Gare départ / Heure départ / Gare arrivée / Heure arrivée / Arrêt / Passage / Type
            imported.forEach(row => {
                trajets.push({
                    id: Date.now() + Math.random(),
                    nom: row[0],
                    gareDepart: row[1],
                    heureDepart: row[2],
                    gareArrivee: row[3],
                    heureArrivee: row[4],
                    arret: row[5],
                    passage: row[6],
                    type: row[7],
                    retard: 0
                });
            });
            localStorage.setItem("trajets", JSON.stringify(trajets));
            displayTrajets();
        };
        reader.readAsText(file);
    });

});
