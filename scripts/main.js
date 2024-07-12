document.addEventListener('DOMContentLoaded', function() {
    const ideeContainer = document.querySelector('#idee-container');
    const ideeURL = 'http://localhost:3000/idees';
    let allIdees = [];

    const displayIdees = (idees) => {
        ideeContainer.innerHTML = '';

        idees.forEach(function(idee) {
            let actionButtons = '';
            
            if (idee.etat !== 'Approuvée' && idee.etat !== 'Désapprouvée') {
                actionButtons = `
                    <i data-id="${idee.id}" class="bi bi-heart-fill text-success" style="font-size: 1.5rem;" data-action="approve" title="Approuver"></i>
                    <i data-id="${idee.id}" class="bi bi-hand-thumbs-down-fill text-warning" style="font-size: 1.5rem;" data-action="reject" title="Désapprouver"></i>
                `;
            }
            
            const ideeHtml = `
                <div class="col-md-4 mb-3">
                    <div id="idee-${idee.id}" class="card">
                        <div class="card-body">
                            <h5 class="card-title">${idee.libelle}</h5>
                            <h6 class="card-subtitle mb-2 text-muted">Auteur: ${idee.auteur}</h6>
                            <p class="card-text">${idee.message}</p>
                            <p class="card-text"><small class="text-muted">État: ${idee.etat}</small></p>
                            <p class="card-text"><small class="text-muted">Catégorie: ${idee.categorie}</small></p>
                            <div class="d-flex justify-content-between">
                                ${actionButtons}
                                <i data-id="${idee.id}" class="bi bi-trash3 text-danger" style="font-size: 1.5rem;" data-action="delete" title="Supprimer"></i>
                            </div>
                        </div>
                    </div>
                </div>`;

            ideeContainer.innerHTML += ideeHtml;
        });
    };

    fetch(ideeURL)
        .then(response => response.json())
        .then(ideeData => {
            allIdees = ideeData;
            displayIdees(allIdees);
        });

    const ideeForm = document.querySelector('#idee-form');
    ideeForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const libelleInput = ideeForm.querySelector('#libelle').value;
        const auteurInput = ideeForm.querySelector('#auteur').value;
        const messageInput = ideeForm.querySelector('#message').value;
        const categorieInput = ideeForm.querySelector('#categorie').value;

        fetch(ideeURL, {
            method: 'POST',
            body: JSON.stringify({
                libelle: libelleInput,
                auteur: auteurInput,
                message: messageInput,
                categorie: categorieInput,
                etat: 'En attente'
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => response.json())
            .then(idee => {
                allIdees.push(idee);
                displayIdees(allIdees);
                ideeForm.reset();
                document.getElementById('submitBtn').disabled = true;
            });
    });

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

    const deleteIdee = (id) => {
        fetch(`${ideeURL}/${id}`, {
            method: 'DELETE'
        }).then(() => {
            allIdees = allIdees.filter(idee => idee.id != id);
            displayIdees(allIdees);
        });
    };

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
        isValid = validateField(document.getElementById('categorie'), document.getElementById('errorCategorie')) && isValid;

        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = !isValid;
    }

    const formInputs = document.querySelectorAll('#idee-form input, #idee-form textarea, #idee-form select');
    formInputs.forEach(input => input.addEventListener('input', validateForm));

    const messageInput = document.getElementById('message');
    messageInput.addEventListener('input', function() {
        if (messageInput.value.length > 255) {
            messageInput.value = messageInput.value.slice(0, 255);
        }
    });
});
