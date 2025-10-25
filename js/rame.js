// ---------------------------
// TRAIN EMPIRE PE - RAME JS
// ---------------------------

// Conteneurs HTML
const materielContainer = document.getElementById('materielContainer');
const finalRame = document.getElementById('finalRame');
const rameForm = document.getElementById('rameForm');
const nomRameInput = document.getElementById('nomRame');
const rameExistantesContainer = document.getElementById('rameExistantesContainer');

// Récupération des données du localStorage
let parcMateriel = JSON.parse(localStorage.getItem('parcMateriel')) || [];
let ramesExistantes = JSON.parse(localStorage.getItem('ramesExistantes')) || [];
let currentRame = [];

// ----- Affichage du parc matériel existant -----
function displayMateriel() {
    materielContainer.innerHTML = '';
    parcMateriel.forEach((m, idx) => {
        const div = document.createElement('div');
        div.className = 'materiel-item';
        div.title = 'Clique pour ajouter à la rame';

        // Image
        const img = document.createElement('img');
        img.src = m.image;
        img.style.height = 'auto';
        img.style.width = (m.longueur ? m.longueur * 10 : 100) + 'px'; // échelle 1px = 10 cm
        img.style.objectFit = 'contain';
        div.appendChild(img);

        // Infos
        const info = document.createElement('div');
        info.className = 'materiel-info';
        info.innerHTML = `
            <strong>${m.nom}</strong><br>
            Type: ${m.type}<br>
            Propulsion: ${m.propulsion}<br>
            Tensions: ${m.tensions.join(', ')}<br>
            Vitesse max: ${m.vitesse} km/h<br>
            Tonnage: ${m.capacite} t<br>
            Longueur: ${m.longueur || 10} m
        `;
        div.appendChild(info);

        // Click pour ajouter à la rame
        div.addEventListener('click', () => addToRame(m));

        materielContainer.appendChild(div);
    });
}

// ----- Ajouter un train à la rame en formation -----
function addToRame(train) {
    const totalLength = currentRame.reduce((sum, t) => sum + (t.longueur || 10), 0);
    const trainLength = train.longueur || 10;

    if (totalLength + trainLength > 750) {
        alert('Longueur maximale de la rame atteinte (750 m)');
        return;
    }
    currentRame.push(train);
    displayCurrentRame();
}

// ----- Affichage de la rame en formation -----
function displayCurrentRame() {
    finalRame.innerHTML = '';

    if (currentRame.length === 0) {
        finalRame.textContent = 'Aucun train ajouté pour le moment.';
        return;
    }

    const scrollDiv = document.createElement('div');
    scrollDiv.className = 'rame-scroll';
    scrollDiv.style.display = 'flex';
    scrollDiv.style.gap = '2px';
    scrollDiv.style.alignItems = 'flex-end'; // alignement par le bas
    scrollDiv.style.overflowX = 'auto';
    scrollDiv.style.padding = '5px';
    scrollDiv.style.backgroundColor = '#1a1a1a';
    scrollDiv.style.borderRadius = '6px';

    currentRame.forEach(train => {
        const trainDiv = document.createElement('div');
        trainDiv.style.display = 'flex';
        trainDiv.style.flexDirection = 'column';
        trainDiv.style.alignItems = 'center';
        trainDiv.style.marginRight = '5px';

        const img = document.createElement('img');
        img.src = train.image;
        img.style.height = 'auto';
        img.style.width = (train.longueur ? train.longueur * 10 : 100) + 'px'; // échelle 1px = 10cm
        img.style.objectFit = 'contain';
        img.style.display = 'block';
        trainDiv.appendChild(img);

        const info = document.createElement('div');
        info.style.fontSize = '12px';
        info.style.textAlign = 'center';
        info.innerHTML = `
            ${train.nom}<br>
            V: ${train.vitesse} km/h<br>
            T: ${train.capacite} t<br>
            L: ${train.longueur || 10} m
        `;
        trainDiv.appendChild(info);

        scrollDiv.appendChild(trainDiv);
    });

    finalRame.appendChild(scrollDiv);
}

// ----- Sauvegarde de la rame -----
rameForm.addEventListener('submit', e => {
    e.preventDefault();
    const nomRame = nomRameInput.value.trim();

    if (!nomRame) {
        alert('Veuillez donner un nom à la rame.');
        return;
    }
    if (currentRame.length === 0) {
        alert('Veuillez ajouter au moins un train à la rame.');
        return;
    }

    const vitesseMin = Math.min(...currentRame.map(t => t.vitesse));
    const tonnageTotal = currentRame.reduce((sum, t) => sum + t.capacite, 0);
    const longueurTotal = currentRame.reduce((sum, t) => sum + (t.longueur || 10), 0);

    const newRame = {
        nom: nomRame,
        trains: currentRame,
        vitesse: vitesseMin,
        tonnage: tonnageTotal,
        longueur: longueurTotal
    };

    ramesExistantes.push(newRame);
    localStorage.setItem('ramesExistantes', JSON.stringify(ramesExistantes));
    currentRame = [];
    displayCurrentRame();
    displayRamesExistantes();
    rameForm.reset();
});

// ----- Affichage des rames déjà créées -----
function displayRamesExistantes() {
    rameExistantesContainer.innerHTML = '';

    ramesExistantes.forEach((r, idx) => {
        const div = document.createElement('div');
        div.className = 'rame-item';
        div.style.display = 'flex';
        div.style.flexDirection = 'column';
        div.style.alignItems = 'center';
        div.style.marginBottom = '10px';
        div.style.width = 'auto';
        div.style.backgroundColor = '#222';
        div.style.padding = '8px';
        div.style.borderRadius = '6px';
        div.style.border = '1px solid #444';

        // Scroll horizontal des trains
        const scrollDiv = document.createElement('div');
        scrollDiv.className = 'rame-scroll';
        scrollDiv.style.display = 'flex';
        scrollDiv.style.gap = '2px';
        scrollDiv.style.alignItems = 'flex-end';
        scrollDiv.style.overflowX = 'auto';
        scrollDiv.style.padding = '5px';

        r.trains.forEach(train => {
            const trainDiv = document.createElement('div');
            trainDiv.style.display = 'flex';
            trainDiv.style.flexDirection = 'column';
            trainDiv.style.alignItems = 'center';
            trainDiv.style.marginRight = '5px';

            const img = document.createElement('img');
            img.src = train.image;
            img.style.height = 'auto';
            img.style.width = (train.longueur ? train.longueur * 10 : 100) + 'px';
            img.style.objectFit = 'contain';
            img.style.display = 'block';
            trainDiv.appendChild(img);

            const info = document.createElement('div');
            info.style.fontSize = '12px';
            info.style.textAlign = 'center';
            info.innerHTML = `
                ${train.nom}<br>
                V: ${train.vitesse} km/h<br>
                T: ${train.capacite} t<br>
                L: ${train.longueur || 10} m
            `;
            trainDiv.appendChild(info);

            scrollDiv.appendChild(trainDiv);
        });

        div.appendChild(scrollDiv);

        // Infos générales de la rame
        const infoGlobal = document.createElement('div');
        infoGlobal.className = 'rame-info';
        infoGlobal.innerHTML = `
            <strong>${r.nom}</strong><br>
            Vitesse: ${r.vitesse} km/h<br>
            Tonnage: ${r.tonnage} t<br>
            Longueur: ${r.longueur} m
        `;
        infoGlobal.style.textAlign = 'center';
        infoGlobal.style.fontSize = '12px';
        infoGlobal.style.marginTop = '5px';
        div.appendChild(infoGlobal);

        // Bouton supprimer
        const btn = document.createElement('button');
        btn.textContent = 'Supprimer';
        btn.onclick = () => {
            ramesExistantes.splice(idx, 1);
            localStorage.setItem('ramesExistantes', JSON.stringify(ramesExistantes));
            displayRamesExistantes();
        };
        btn.style.marginTop = '5px';
        div.appendChild(btn);

        rameExistantesContainer.appendChild(div);
    });
}

// ----- Initialisation -----
displayMateriel();
displayCurrentRame();
displayRamesExistantes();
