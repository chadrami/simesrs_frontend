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

  // Fonction pour afficher le loading dans un select
  const showSelectLoading = (selectElement) => {
    const loadingOption = document.createElement('option');
    loadingOption.value = '';
    loadingOption.disabled = true;
    loadingOption.selected = true;
    
    const spinner = document.createElement('span');
    spinner.className = 'spinner-border spinner-border-sm me-2';
    spinner.setAttribute('role', 'status');
    
    loadingOption.appendChild(spinner);
    loadingOption.appendChild(document.createTextNode(MESSAGES.loading));
    
    selectElement.innerHTML = '';
    selectElement.appendChild(loadingOption);
    selectElement.disabled = true;
  };

  // Charger les établissements
  const loadInstitutions = async () => {
    try {
      showSelectLoading(etablissementSelect);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INSTITUTIONS}`);
      
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      
      const data = await response.json();
      if (data.count === 0) throw new Error(MESSAGES.noInstitutions);
      
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

  // Charger les formations
  const loadPrograms = async (codeEtablissement) => {
    if (!codeEtablissement) return;
    
    try {
      showSelectLoading(formationSelect);
      
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DEGREE_PROGRAMS}/${codeEtablissement}${API_CONFIG.ENDPOINTS.FIRST_CYCLE_PROGRAMS}`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      
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
    
    // Afficher le spinner sur le bouton
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
      await new Promise(resolve => setTimeout(resolve, 500)); // Petit délai pour voir le spinner
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