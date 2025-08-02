import { showAlert, clearSessionStorage } from './utils.js';
import { API_CONFIG, ROUTES } from './config.js';
import { getPreferredLanguage, translations } from './i18n.js';

let allStudents = [];
let currentLang = 'fr';

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

const highlightSearchTerm = (text, term) => {
  if (!term || !text) return text;
  
  try {
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
  } catch (e) {
    return text;
  }
};

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

function displayStudents(students, lang, searchTerm = '') {
  const tbody = document.getElementById('etudiants-list');
  const MESSAGES = translations[lang];
  
  tbody.innerHTML = '';
  
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

  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(tooltipTriggerEl => {
    return new bootstrap.Tooltip(tooltipTriggerEl, {
      boundary: document.body,
      customClass: 'notes-tooltip'
    });
  });
}

function setupSearch() {
  const searchInput = document.getElementById('search-input');
  const resetSearch = document.getElementById('reset-search');
  const lang = getPreferredLanguage();
  const MESSAGES = translations[lang];

  searchInput.placeholder = MESSAGES.searchPlaceholder;
  resetSearch.title = MESSAGES.searchReset;

  searchInput.addEventListener('input', (e) => {
    displayStudents(allStudents, currentLang, e.target.value.trim());
  });

  resetSearch.addEventListener('click', () => {
    searchInput.value = '';
    displayStudents(allStudents, currentLang);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  currentLang = getPreferredLanguage();
  const MESSAGES = translations[currentLang];
  
  document.getElementById('dispute-notice-text').textContent = MESSAGES.disputeNotice;
  showSkeleton();

  window.addEventListener('beforeunload', () => {
    clearSessionStorage();
  });

  try {
    const storedData = sessionStorage.getItem('consultationData');
    if (!storedData) {
      window.location.href = ROUTES.HOME;
      return;
    }
    
    const { etablissement, formation, etablissementCode, formationCode } = JSON.parse(storedData);
    document.getElementById('etablissement-nom').textContent = etablissement;
    document.getElementById('formation-nom').textContent = formation;
    
    const currentYear = new Date().getFullYear();
    const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROGRAM_RANKING}${formationCode}/${currentYear}/ranking/`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(MESSAGES.errorLoadingData);
    const data = await response.json();
    
    allStudents = data.results.map(student => ({
      matricule: student.matricule,
      fullName: getStudentDisplayName(student, currentLang),
      rank: student.rank,
      moyenne: parseFloat(student.mg),
      notes: student.notes
    })).sort((a, b) => a.rank - b.rank);
    
    displayStudents(allStudents, currentLang);
    setupSearch();
    
    document.getElementById('back-button').addEventListener('click', () => {
      clearSessionStorage();
      window.location.href = ROUTES.HOME;
    });
    
  } catch (err) {
    console.error('Erreur:', err);
    showAlert(document.querySelector('.card-body'), 'danger', err.message || MESSAGES.errorLoadingData);
  }
});