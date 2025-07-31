// js/notes.js
import { showAlert } from './utils.js';
import { API_CONFIG, ROUTES } from './config.js';
import { getPreferredLanguage, translations } from './i18n.js';

document.addEventListener('DOMContentLoaded', async () => {
  const lang = getPreferredLanguage();
  const MESSAGES = translations[lang];
  
  const form = document.getElementById('selection-form');
  const etablissementSelect = document.getElementById('input-etablissement');
  const formationSelect = document.getElementById('input-formation');
  const messageDiv = document.getElementById('message');
  const submitBtn = document.getElementById('submit-btn');

  // Initialiser les placeholders
  etablissementSelect.querySelector('option').textContent = MESSAGES.selectInstitution;
  formationSelect.querySelector('option').textContent = MESSAGES.selectProgramFirst;

  // Charger les établissements
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INSTITUTIONS}`);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.count === 0) {
      throw new Error(MESSAGES.noInstitutions);
    }
    
    // Trier par nom dans la langue sélectionnée
    data.results.sort((a, b) => {
      const nameA = a[`name_${lang}`] || a.name_fr;
      const nameB = b[`name_${lang}`] || b.name_fr;
      return nameA.localeCompare(nameB);
    });
    
    etablissementSelect.innerHTML = `<option value="" selected disabled>${MESSAGES.selectInstitution}</option>`;
    data.results.forEach(etablissement => {
      const option = document.createElement('option');
      option.value = etablissement.code;
      // Utiliser le nom dans la langue sélectionnée, avec fallback sur le français
      option.textContent = etablissement[`name_${lang}`] || etablissement.name_fr;
      etablissementSelect.appendChild(option);
    });
    
  } catch (err) {
    showAlert(messageDiv, 'danger', err.message);
  }

  // Lorsque l'établissement change
  etablissementSelect.addEventListener('change', async () => {
    const codeEtablissement = etablissementSelect.value;
    
    if (!codeEtablissement) return;
    
    formationSelect.disabled = true;
    formationSelect.innerHTML = `<option value="" selected disabled>${MESSAGES.loading}</option>`;
    
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DEGREE_PROGRAMS}/${codeEtablissement}${API_CONFIG.ENDPOINTS.FIRST_CYCLE_PROGRAMS}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.count === 0) {
        throw new Error(MESSAGES.noPrograms);
      }
      
      // Trier par label dans la langue sélectionnée
      data.results.sort((a, b) => {
        const labelA = a[`label_${lang}`] || a.label_fr;
        const labelB = b[`label_${lang}`] || b.label_fr;
        return labelA.localeCompare(labelB);
      });
      
      formationSelect.innerHTML = `<option value="" selected disabled>${MESSAGES.selectProgramFirst}</option>`;
      data.results.forEach(formation => {
        const option = document.createElement('option');
        option.value = formation.code;
        // Utiliser le label dans la langue sélectionnée, avec fallback sur le français
        option.textContent = formation[`label_${lang}`] || formation.label_fr;
        formationSelect.appendChild(option);
      });
      
      formationSelect.disabled = false;
    } catch (err) {
      formationSelect.innerHTML = `<option value="" selected disabled>${err.message}</option>`;
      showAlert(messageDiv, 'danger', err.message);
    }
  });

  // Soumission du formulaire
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!etablissementSelect.value || !formationSelect.value) {
      showAlert(messageDiv, 'danger', MESSAGES.selectInstitutionFirst);
      return;
    }
    
    const selectedEtablissementText = etablissementSelect.options[etablissementSelect.selectedIndex].text;
    const selectedFormationText = formationSelect.options[formationSelect.selectedIndex].text;
    
    const consultationData = {
      etablissement: selectedEtablissementText,
      etablissementCode: etablissementSelect.value,
      formation: selectedFormationText,
      formationCode: formationSelect.value,
      lang: lang // Sauvegarder la langue courante
    };
    
    sessionStorage.setItem('consultationData', JSON.stringify(consultationData));
    window.location.href = ROUTES.NOTES;
  });
});