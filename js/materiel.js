// ===== Materiel.js =====

// Récupération du container et du formulaire
const materielForm = document.getElementById("materielForm");
const materielContainer = document.getElementById("materielContainer");

// Charge les trains existants depuis le LocalStorage
let materielData = JSON.parse(localStorage.getItem("materielData")) || [];

// Fonction pour afficher le matériel existant
function displayMateriel() {
    materielContainer.innerHTML = "";
    materielData.forEach((item, index) => {
        const div = document.createElement("div");
        div.classList.add("materiel-item");

        // Image
        const img = document.createElement("img");
        img.src = item.imageSrc || "assets/img/ui/default.png";
        div.appendChild(img);

        // Info texte
        const info = document.createElement("div");
        info.classList.add("materiel-info");
        info.innerHTML = `
      <strong>${item.nom}</strong><br>
      Type : ${item.type}<br>
      Tensions : ${item.tensions.join(", ")}<br>
      Vitesse : ${item.vitesse} km/h<br>
      Capacité : ${item.capacite || "-"}
    `;
        div.appendChild(info);

        // Bouton supprimer
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Supprimer";
        deleteBtn.onclick = () => {
            materielData.splice(index, 1);
            saveMateriel();
            displayMateriel();
        };
        div.appendChild(deleteBtn);

        materielContainer.appendChild(div);
    });
}

// Fonction pour sauvegarder le matériel dans le LocalStorage
function saveMateriel() {
    localStorage.setItem("materielData", JSON.stringify(materielData));
}

// Gestion du formulaire
materielForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const nom = document.getElementById("nom").value.trim();
    const type = document.getElementById("type").value;
    const tensions = Array.from(document.getElementById("tensions").selectedOptions).map(opt => opt.value);
    const vitesse = parseInt(document.getElementById("vitesse").value) || 0;
    const capacite = parseInt(document.getElementById("capacite").value) || null;
    const imageInput = document.getElementById("image");

    if (!nom) {
        alert("Veuillez renseigner un nom pour le train.");
        return;
    }

    // Gestion de l'image importée
    let reader = new FileReader();
    if (imageInput.files[0]) {
        reader.readAsDataURL(imageInput.files[0]);
        reader.onload = function () {
            const imageSrc = reader.result;

            const newMateriel = { nom, type, tensions, vitesse, capacite, imageSrc };
            materielData.push(newMateriel);
            saveMateriel();
            displayMateriel();

            materielForm.reset();
        };
    } else {
        // Pas d'image : on met image par défaut
        const newMateriel = { nom, type, tensions, vitesse, capacite, imageSrc: "assets/img/ui/default.png" };
        materielData.push(newMateriel);
        saveMateriel();
        displayMateriel();

        materielForm.reset();
    }
});

// Initial display
displayMateriel();
