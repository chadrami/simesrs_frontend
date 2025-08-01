import { showAlert } from './utils.js';
import { API_CONFIG, ROUTES } from './config.js';
import { getPreferredLanguage, translations } from './i18n.js';

document.addEventListener('DOMContentLoaded', async () => {
  const lang = getPreferredLanguage();
  const MESSAGES = translations[lang];
  
  // Afficher le message
  document.getElementById('dispute-notice-text').textContent = MESSAGES.disputeNotice;

  // Fonction pour afficher le skeleton loader
  const showSkeleton = () => {
    const tbody = document.getElementById('etudiants-list');
    tbody.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="text-center"><div class="skeleton skeleton-sm"></div></td>
        <td><div class="skeleton"></div></td>
        <td class="text-end"><div class="skeleton skeleton-sm"></div></td>
      `;
      tbody.appendChild(tr);
    }
  };

  try {
    const storedData = sessionStorage.getItem('consultationData');
    if (!storedData) {
      window.location.href = ROUTES.HOME;
      return;
    }
    
    const { etablissement, formation } = JSON.parse(storedData);
    document.getElementById('etablissement-nom').textContent = etablissement;
    document.getElementById('formation-nom').textContent = formation;
    
    // Afficher le skeleton avant le chargement
    showSkeleton();
    
    // Simuler un chargement (remplacer par un vrai appel API)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const etudiants = generateMockStudents();
    displayStudents(etudiants);
    
    // Gestion du bouton de retour
    document.getElementById('back-button').addEventListener('click', () => {
      // Option 1: Simple redirection
      window.location.href = ROUTES.HOME;
      
      // Option 2: Avec gestion d'historique
      // window.history.replaceState(null, '', ROUTES.HOME);
      // window.location.reload();
    });
    
  } catch (err) {
    showAlert(document.querySelector('.card-body'), 'danger', MESSAGES.errorLoadingData);
  }
});

function displayStudents(etudiants) {
  const tbody = document.getElementById('etudiants-list');
  tbody.innerHTML = '';
  
  if (etudiants.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" class="text-center py-4 text-muted">
          ${MESSAGES.noResults}
        </td>
      </tr>
    `;
    return;
  }
  
  etudiants.forEach(etudiant => {
    const tr = document.createElement('tr');
    tr.className = 'fade-in';
    tr.innerHTML = `
      <td class="text-center fw-semibold">${etudiant.rang}</td>
      <td>${etudiant.prenom} ${etudiant.nom}</td>
      <td class="text-end fw-bold text-primary">${etudiant.moyenne.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });
}

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