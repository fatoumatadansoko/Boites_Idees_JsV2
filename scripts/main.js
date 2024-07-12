document.addEventListener('DOMContentLoaded', function() {
    const ideeContainer = document.querySelector('#idee-container');
    const ideeURL = 'http://localhost:3000/idees';
    let allIdees = [];

    // Fonction pour afficher les idées
    const displayIdees = (idees) => {
        ideeContainer.innerHTML = '';

        idees.forEach(function(idee) {
            const ideeHtml = `
                <div class="col-md-4 mb-3">
                    <div id="idee-${idee.id}" class="card">
                        <div class="card-body">
                            <h5 class="card-title">${idee.libelle}</h5>
                            <h6 class="card-subtitle mb-2 text-muted">Auteur: ${idee.auteur}</h6>
                            <p class="card-text">${idee.message}</p>
                            <p class="card-text"><small class="text-muted">État: ${idee.etat}</small></p>
                            <p class="card-text"><small class="text-muted">Catégorie: ${idee.categorie}</small></p>
                            <button data-id="${idee.id}" class="btn btn-success" data-action="approve">Approuver</button>
                            <button data-id="${idee.id}" class="btn btn-warning" data-action="reject">Désapprouvée</button>
                            <button data-id="${idee.id}" class="btn btn-danger" data-action="delete">Supprimer</button>
                        </div>
                    </div>
                </div>`;

            ideeContainer.innerHTML += ideeHtml;
        });
    };

    // Récupération et affichage des idées existantes
    fetch(ideeURL)
        .then(response => response.json())
        .then(ideeData => {
            allIdees = ideeData;
            displayIdees(allIdees);
        });

    // Gestion de la soumission du formulaire
    const ideeForm = document.querySelector('#idee-form');
    ideeForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const libelleInput = ideeForm.querySelector('#libelle').value;
        const auteurInput = ideeForm.querySelector('#auteur').value;
        const messageInput = ideeForm.querySelector('#message').value;
        const etatInput = ideeForm.querySelector('#etat').value; // "En attente" par défaut
        const categorieInput = ideeForm.querySelector('#categorie').value;

        fetch(ideeURL, {
            method: 'POST',
            body: JSON.stringify({
                libelle: libelleInput,
                auteur: auteurInput,
                etat: etatInput,
                categorie: categorieInput,
                message: messageInput
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => response.json())
            .then(idee => {
                allIdees.push(idee);
                displayIdees(allIdees);
                ideeForm.reset();
                document.querySelector('#etat').value = 'En attente'; // Réinitialiser l'état
                submitBtn.disabled = true;
            });
    });

    // Fonction pour mettre à jour l'état d'une idée
    const updateIdeeState = (id, newState) => {
        fetch(`${ideeURL}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ etat: newState }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => response.json())
            .then(updatedIdee => {
                const ideeIndex = allIdees.findIndex(idee => idee.id == updatedIdee.id);
                allIdees[ideeIndex] = updatedIdee;
                displayIdees(allIdees);
            });
    };

    // Fonction pour supprimer une idée
    const deleteIdee = (id) => {
        fetch(`${ideeURL}/${id}`, {
            method: 'DELETE'
        }).then(() => {
            allIdees = allIdees.filter(idee => idee.id != id);
            displayIdees(allIdees);
        });
    };

    // Gestion des boutons approuver, refuser et supprimer
    ideeContainer.addEventListener('click', (e) => {
        const ideeId = e.target.dataset.id;

        if (e.target.dataset.action === 'approve') {
            updateIdeeState(ideeId, 'Approuvée');
        } else if (e.target.dataset.action === 'reject') {
            updateIdeeState(ideeId, 'Désapprouvée');
        } else if (e.target.dataset.action === 'delete') {
            deleteIdee(ideeId);
        }
    });

    // Validation des champs
    function validateField(input, errorElement, minLength, pattern) {
        let isValid = true;
        errorElement.innerHTML = "";

        if (input.value.trim() === "" || (minLength && input.value.length < minLength) || (pattern && !pattern.test(input.value))) {
            errorElement.innerHTML = "Ce champ est requis et doit respecter les contraintes.";
            isValid = false;
        }

        return isValid;
    }

    function validateForm() {
        let isValid = true;

        isValid = validateField(document.getElementById('libelle'), document.getElementById('errorLibelle'), 3) && isValid;
        isValid = validateField(document.getElementById('auteur'), document.getElementById('errorAuteur'), 3) && isValid;
        isValid = validateField(document.getElementById('message'), document.getElementById('errorMessage'), 10) && isValid;
        isValid = validateField(document.getElementById('etat'), document.getElementById('errorEtat'), 3) && isValid;
        isValid = validateField(document.getElementById('categorie'), document.getElementById('errorCategorie'), 3) && isValid;

        submitBtn.disabled = !isValid;
    }

    document.getElementById('libelle').addEventListener('input', validateForm);
    document.getElementById('auteur').addEventListener('input', validateForm);
    document.getElementById('message').addEventListener('input', validateForm);
    document.getElementById('etat').addEventListener('input', validateForm);
    document.getElementById('categorie').addEventListener('input', validateForm);

    ideeForm.addEventListener('submit', function(e) {
        validateForm();
        if (submitBtn.disabled) {
            e.preventDefault();
        } else {
            alert("Formulaire soumis avec succès !");
        }
    });
});
