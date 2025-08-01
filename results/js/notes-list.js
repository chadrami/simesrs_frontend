import { showAlert } from './utils.js';
import { API_CONFIG, ROUTES } from './config.js';
import { getPreferredLanguage, translations } from './i18n.js';

// Variables globales
let allStudents = [];
let currentLang = 'fr';

// Fonction pour afficher le skeleton loader
const showSkeleton = () => {
  const tbody = document.getElementById('etudiants-list');
  tbody.innerHTML = '';
  
  for (let i = 0; i < 5; i++) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="text-center"><div class="skeleton skeleton-sm"></div></td>
      <td><div class="skeleton"></div></td>
      <td><div class="skeleton"></div></td>
      <td class="text-end"><div class="skeleton skeleton-sm"></div></td>
    `;
    tbody.appendChild(tr);
  }
};

// Fonction pour récupérer le nom complet avec fallback
const getStudentDisplayName = (student, lang) => {
  if (!student) return 'Nom inconnu';
  
  const primaryField = lang === 'ar' ? 'full_name_ar' : 'full_name_fr';
  const fallbackField = lang === 'ar' ? 'full_name_fr' : 'full_name_ar';
  
  if (student[primaryField] && student[primaryField].trim() !== '') {
    return student[primaryField];
  }
  
  if (student[fallbackField] && student[fallbackField].trim() !== '') {
    return student[fallbackField];
  }
  
  return 'Nom inconnu';
};

// Fonction pour surligner les termes de recherche
const highlightSearchTerm = (text, term) => {
  if (!term || !text) return text;
  
  try {
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
  } catch (e) {
    return text;
  }
};

// Fonction pour formater le tooltip des notes
const formatNotesTooltip = (notes, lang) => {
  const semesters = Object.entries(notes)
    .sort(([s1], [s2]) => s1.localeCompare(s2))
    .map(([semester, note]) => `
      <div class="tooltip-semester">
        <span>${semester}:</span>
        <span>${note}</span>
      </div>
    `).join('');

  return `<div class="tooltip-notes">${semesters}</div>`;
};

// Fonction pour afficher les étudiants (avec filtrage)
function displayStudents(students, lang, searchTerm = '') {
  const tbody = document.getElementById('etudiants-list');
  const MESSAGES = translations[lang];
  
  tbody.innerHTML = '';
  
  // Filtrer les étudiants si un terme de recherche est fourni
  const filteredStudents = searchTerm 
    ? students.filter(student => {
        const searchLower = searchTerm.toLowerCase();
        return (
          student.fullName.toLowerCase().includes(searchLower) ||
          (student.matricule && student.matricule.toLowerCase().includes(searchLower))
        );
      })
    : students;

  if (filteredStudents.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-4 text-muted">
          ${searchTerm ? MESSAGES.noResultsFound : MESSAGES.noResults}
        </td>
      </tr>
    `;
    return;
  }

  // Mettre à jour les en-têtes du tableau
  const headers = [
    { class: 'text-center', text: MESSAGES.rank },
    { class: 'matricule-header', text: MESSAGES.matricule },
    { text: MESSAGES.name },
    { class: 'text-end', text: MESSAGES.average }
  ];

  const thead = document.querySelector('thead tr');
  thead.innerHTML = headers.map(header => 
    `<th class="${header.class || ''}">${header.text}</th>`
  ).join('');

  // Afficher les étudiants filtrés
  filteredStudents.forEach(etudiant => {
    const tr = document.createElement('tr');
    tr.className = 'fade-in';
    
    const tooltipContent = formatNotesTooltip(etudiant.notes, lang);
    
    tr.innerHTML = `
      <td class="text-center fw-semibold">${etudiant.rank}</td>
      <td>${etudiant.matricule || 'N/A'}</td>
      <td>${highlightSearchTerm(etudiant.fullName, searchTerm)}</td>
      <td class="text-end fw-bold text-primary position-relative">
        <span class="moyenne-tooltip" 
               data-bs-toggle="tooltip" 
               data-bs-html="true"
               data-bs-placement="left"
               title="${tooltipContent.replace(/"/g, '&quot;')}">
          ${etudiant.moyenne.toFixed(2)}
        </span>
      </td>
    `;
    
    tbody.appendChild(tr);
  });

  // Activer les tooltips Bootstrap
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(tooltipTriggerEl => {
    return new bootstrap.Tooltip(tooltipTriggerEl, {
      boundary: document.body,
      customClass: 'notes-tooltip'
    });
  });
}

// Configuration de la recherche
function setupSearch() {
  const searchInput = document.getElementById('search-input');
  const resetSearch = document.getElementById('reset-search');
  const lang = getPreferredLanguage();
  const MESSAGES = translations[lang];

  // Mettre à jour le placeholder
  searchInput.placeholder = MESSAGES.searchPlaceholder;
  resetSearch.title = MESSAGES.searchReset;

  // Gérer la recherche en temps réel
  searchInput.addEventListener('input', (e) => {
    displayStudents(allStudents, currentLang, e.target.value.trim());
  });

  // Réinitialiser la recherche
  resetSearch.addEventListener('click', () => {
    searchInput.value = '';
    displayStudents(allStudents, currentLang);
  });
}

// Code principal
document.addEventListener('DOMContentLoaded', async () => {
  currentLang = getPreferredLanguage();
  const MESSAGES = translations[currentLang];
  
  // Afficher le message
  document.getElementById('dispute-notice-text').textContent = MESSAGES.disputeNotice;

  // Afficher le skeleton avant le chargement
  showSkeleton();

  try {
    const storedData = sessionStorage.getItem('consultationData');
    if (!storedData) {
      window.location.href = ROUTES.HOME;
      return;
    }
    
    const { etablissement, formation, etablissementCode, formationCode } = JSON.parse(storedData);
    document.getElementById('etablissement-nom').textContent = etablissement;
    document.getElementById('formation-nom').textContent = formation;
    
    // Construire l'URL selon la structure de votre API
    const currentYear = new Date().getFullYear();
    const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROGRAM_RANKING}${formationCode}/${currentYear}/ranking/`;
    
    // Récupérer les résultats des étudiants
    const response = await fetch(apiUrl);
    
    if (!response.ok) throw new Error(MESSAGES.errorLoadingData);
    const data = await response.json();
    
    // Stocker et préparer les données
    allStudents = data.results.map(student => ({
      matricule: student.matricule,
      fullName: getStudentDisplayName(student, currentLang),
      rank: student.rank,
      moyenne: parseFloat(student.mg),
      notes: student.notes
    })).sort((a, b) => a.rank - b.rank);
    
    // Afficher initialement tous les étudiants
    displayStudents(allStudents, currentLang);
    
    // Configurer la recherche
    setupSearch();
    
    // Gestion du bouton de retour
    document.getElementById('back-button').addEventListener('click', () => {
      window.location.href = ROUTES.HOME;
    });
    
  } catch (err) {
    console.error('Erreur:', err);
    showAlert(document.querySelector('.card-body'), 'danger', err.message || MESSAGES.errorLoadingData);
  }
});