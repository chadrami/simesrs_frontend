import { showAlert, clearSessionStorage } from './utils.js';
import { API_CONFIG, ROUTES } from './config.js';
import { getPreferredLanguage, translations } from './i18n.js';

const resetFormState = () => {
  const submitBtn = document.getElementById('submit-btn');
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `
      <span id="button-text">
        <i class="bi bi-search me-2"></i>${translations[getPreferredLanguage()].viewGrades}
      </span>
    `;
  }
  
  const formationSelect = document.getElementById('input-formation');
  if (formationSelect) {
    formationSelect.disabled = true;
    formationSelect.innerHTML = `<option value="" selected disabled>${translations[getPreferredLanguage()].selectProgramFirst}</option>`;
  }
};

const loadInstitutions = async () => {
  const lang = getPreferredLanguage();
  const MESSAGES = translations[lang];
  const etablissementSelect = document.getElementById('input-etablissement');
  const messageDiv = document.getElementById('message');

  try {
    // Afficher le loading
    etablissementSelect.innerHTML = `
      <option value="" selected disabled>
        <span class="spinner-border spinner-border-sm me-2"></span>
        ${MESSAGES.loading}
      </option>
    `;

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INSTITUTIONS}`);
    if (!response.ok) throw new Error(MESSAGES.errorLoadingData);
    
    const data = await response.json();
    if (data.count === 0) throw new Error(MESSAGES.noInstitutions);

    // Trier et afficher les établissements
    data.results.sort((a, b) => {
      const nameA = a[`name_${lang}`] || a.name_fr;
      const nameB = b[`name_${lang}`] || b.name_fr;
      return nameA.localeCompare(nameB);
    });

    etablissementSelect.innerHTML = `<option value="" selected disabled>${MESSAGES.selectInstitution}</option>`;
    data.results.forEach(etablissement => {
      const option = document.createElement('option');
      option.value = etablissement.code;
      option.textContent = etablissement[`name_${lang}`] || etablissement.name_fr;
      etablissementSelect.appendChild(option);
    });

  } catch (err) {
    showAlert(messageDiv, 'danger', err.message);
    etablissementSelect.innerHTML = `<option value="" selected disabled>${MESSAGES.selectInstitution}</option>`;
  } finally {
    etablissementSelect.disabled = false;
  }
};

const loadPrograms = async (codeEtablissement) => {
  const lang = getPreferredLanguage();
  const MESSAGES = translations[lang];
  const formationSelect = document.getElementById('input-formation');
  const messageDiv = document.getElementById('message');

  if (!codeEtablissement) return;

  try {
    formationSelect.innerHTML = `
      <option value="" selected disabled>
        <span class="spinner-border spinner-border-sm me-2"></span>
        ${MESSAGES.loading}
      </option>
    `;

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DEGREE_PROGRAMS}/${codeEtablissement}${API_CONFIG.ENDPOINTS.FIRST_CYCLE_PROGRAMS}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(MESSAGES.errorLoadingData);

    const data = await response.json();
    if (data.count === 0) throw new Error(MESSAGES.noPrograms);

    data.results.sort((a, b) => {
      const labelA = a[`label_${lang}`] || a.label_fr;
      const labelB = b[`label_${lang}`] || b.label_fr;
      return labelA.localeCompare(labelB);
    });

    formationSelect.innerHTML = `<option value="" selected disabled>${MESSAGES.selectProgramFirst}</option>`;
    data.results.forEach(formation => {
      const option = document.createElement('option');
      option.value = formation.code;
      option.textContent = formation[`label_${lang}`] || formation.label_fr;
      formationSelect.appendChild(option);
    });

  } catch (err) {
    showAlert(messageDiv, 'danger', err.message);
    formationSelect.innerHTML = `<option value="" selected disabled>${err.message}</option>`;
  } finally {
    formationSelect.disabled = false;
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  const lang = getPreferredLanguage();
  const MESSAGES = translations[lang];
  const form = document.getElementById('selection-form');
  const etablissementSelect = document.getElementById('input-etablissement');
  const formationSelect = document.getElementById('input-formation');
  const messageDiv = document.getElementById('message');
  const submitBtn = document.getElementById('submit-btn');

  // Gestion du retour navigateur
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      resetFormState();
      clearSessionStorage();
    }
  });

  // Gestion du changement d'établissement
  etablissementSelect.addEventListener('change', () => {
    loadPrograms(etablissementSelect.value);
  });

  // Gestion de la soumission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!etablissementSelect.value || !formationSelect.value) {
      showAlert(messageDiv, 'danger', MESSAGES.selectInstitutionFirst);
      return;
    }
    
    // Afficher le spinner
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = `
      <span class="spinner-border spinner-border-sm me-2" role="status"></span>
      ${MESSAGES.loading}
    `;
    submitBtn.disabled = true;
    
    try {
      const consultationData = {
        etablissement: etablissementSelect.options[etablissementSelect.selectedIndex].text,
        etablissementCode: etablissementSelect.value,
        formation: formationSelect.options[formationSelect.selectedIndex].text,
        formationCode: formationSelect.value,
        lang: lang
      };
      
      sessionStorage.setItem('consultationData', JSON.stringify(consultationData));
      await new Promise(resolve => setTimeout(resolve, 500));
      window.location.href = ROUTES.NOTES;
      
    } catch (err) {
      showAlert(messageDiv, 'danger', err.message);
      submitBtn.innerHTML = originalContent;
      submitBtn.disabled = false;
    }
  });

  // Chargement initial
  await loadInstitutions();
});