import { showAlert } from './utils.js';
import { API_CONFIG, MESSAGES, ROUTES } from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Afficher immédiatement le message
  document.getElementById('dispute-notice-text').textContent = MESSAGES.DISPUTE_NOTICE;

  try {
    const storedData = sessionStorage.getItem('consultationData');
    if (!storedData) {
      window.location.href = ROUTES.HOME;
      return;
    }
    
    const { etablissement, formation } = JSON.parse(storedData);
    document.getElementById('etablissement-nom').textContent = etablissement;
    document.getElementById('formation-nom').textContent = formation;
    
    document.querySelector('.alert-info').innerHTML = `
      <i class="bi bi-info-circle-fill me-2"></i>
      ${MESSAGES.DISPUTE_NOTICE}
    `;
    
    console.log('Chargement des étudiants...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const etudiants = generateMockStudents();
    console.log(`${etudiants.length} étudiants chargés`);
    
    const tbody = document.getElementById('etudiants-list');
    tbody.innerHTML = '';
    
    etudiants.forEach(etudiant => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="text-center fw-semibold">${etudiant.rang}</td>
        <td>${etudiant.prenom} ${etudiant.nom}</td>
        <td class="text-end fw-bold" style="color: var(--primary)">${etudiant.moyenne.toFixed(2)}</td>
      `;
      tbody.appendChild(tr);
    });
    
    console.log('Liste des étudiants affichée avec succès');
  } catch (err) {
    console.error('Erreur:', err);
    showAlert(document.querySelector('.card-body'), 'danger', 'Une erreur est survenue lors du chargement des données');
  }
});

function generateMockStudents() {
  const etudiants = [
    { prenom: "Mohamed", nom: "Ahmed Salem", moyenne: 16.75 },
    { prenom: "Aichetou", nom: "Mohamed Lemine", moyenne: 15.50 },
    { prenom: "Boubacar", nom: "Sidi Oumar", moyenne: 14.25 },
    { prenom: "Fatimetou", nom: "Brahim Ely", moyenne: 13.80 },
    { prenom: "Mariem", nom: "Sidi Mohamed", moyenne: 12.90 },
    { prenom: "Cheikh", nom: "Abdallahi Ould Mohamed", moyenne: 12.30 },
    { prenom: "Vatma", nom: "Sidi Mohamed", moyenne: 11.75 },
    { prenom: "El Hacen", nom: "Mohamed El Moustapha", moyenne: 11.20 },
    { prenom: "Khadijetou", nom: "Sidi Ahmed", moyenne: 10.85 },
    { prenom: "Moussa", nom: "Alioune Sarr", moyenne: 10.50 }
  ];

  return etudiants
    .sort((a, b) => b.moyenne - a.moyenne)
    .map((etudiant, index) => ({
      ...etudiant,
      rang: index + 1
    }));
}