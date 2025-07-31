// js/notes-list.js
import { showAlert } from './utils.js';
import { API_CONFIG, ROUTES } from './config.js';
import { getPreferredLanguage, translations } from './i18n.js';

document.addEventListener('DOMContentLoaded', async () => {
  const lang = getPreferredLanguage();
  const MESSAGES = translations[lang];
  
  // Afficher immédiatement le message
  document.getElementById('dispute-notice-text').textContent = MESSAGES.disputeNotice;

  try {
    const storedData = sessionStorage.getItem('consultationData');
    if (!storedData) {
      window.location.href = ROUTES.HOME;
      return;
    }
    
    const { etablissement, formation, etablissementCode, formationCode, lang: storedLang } = JSON.parse(storedData);
    
    // Utiliser la langue stockée ou celle courante
    const displayLang = storedLang || lang;
    
    document.getElementById('etablissement-nom').textContent = etablissement;
    document.getElementById('formation-nom').textContent = formation;
    
    // Simuler un chargement
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Ici, normalement tu ferais une requête API pour récupérer les étudiants
    // Exemple fictif avec des données mockées
    const etudiants = await loadStudents(formationCode, displayLang);
    
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
    
  } catch (err) {
    showAlert(document.querySelector('.card-body'), 'danger', MESSAGES.errorLoadingData || 'Une erreur est survenue lors du chargement des données');
  }
});

// Fonction fictive pour charger les étudiants - à remplacer par ton appel API réel
async function loadStudents(formationCode, lang) {
  // En réalité, tu ferais :
  // const response = await fetch(`${API_CONFIG.BASE_URL}/formations/${formationCode}/etudiants`);
  // const data = await response.json();
  // return processStudentsData(data, lang);
  
  // Pour l'exemple, on utilise des données mockées
  return generateMockStudents();
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

// Fonction pour traiter les données des étudiants selon la langue
function processStudentsData(data, lang) {
  return data.results.map(student => ({
    // Ici tu adapterais selon la structure de ton API
    prenom: student[`first_name_${lang}`] || student.first_name_fr,
    nom: student[`last_name_${lang}`] || student.last_name_fr,
    moyenne: student.average,
    // ... autres champs
  })).sort((a, b) => b.moyenne - a.moyenne)
    .map((student, index) => ({
      ...student,
      rang: index + 1
    }));
}