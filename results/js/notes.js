import { showAlert } from './utils.js';
import { API_CONFIG, MESSAGES, ROUTES } from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Initialisation de la page index.html');
  
  const form = document.getElementById('selection-form');
  const etablissementSelect = document.getElementById('input-etablissement');
  const formationSelect = document.getElementById('input-formation');
  const messageDiv = document.getElementById('message');
  const submitBtn = document.getElementById('submit-btn');

  // Charger les établissements
  try {
    console.log('Chargement des établissements...');
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INSTITUTIONS}`);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Établissements reçus:', data.results.length);
    
    if (data.count === 0) {
      throw new Error(MESSAGES.NO_INSTITUTIONS);
    }
    
    data.results.sort((a, b) => a.name_fr.localeCompare(b.name_fr));
    
    etablissementSelect.innerHTML = '<option value="" selected disabled>Choisissez votre établissement</option>';
    data.results.forEach(etablissement => {
      const option = document.createElement('option');
      option.value = etablissement.code;
      option.textContent = etablissement.name_fr;
      etablissementSelect.appendChild(option);
    });
    
    console.log('Établissements chargés avec succès');
  } catch (err) {
    console.error('Erreur chargement établissements:', err);
    showAlert(messageDiv, 'danger', err.message);
  }

  // Lorsque l'établissement change
  etablissementSelect.addEventListener('change', async () => {
    const codeEtablissement = etablissementSelect.value;
    console.log('Établissement sélectionné:', codeEtablissement);
    
    if (!codeEtablissement) return;
    
    formationSelect.disabled = true;
    formationSelect.innerHTML = `<option value="" selected disabled>${MESSAGES.LOADING}</option>`;
    
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DEGREE_PROGRAMS}/${codeEtablissement}${API_CONFIG.ENDPOINTS.FIRST_CYCLE_PROGRAMS}`;
      console.log('Chargement formations avec URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Formations reçues:', data.results.length);
      
      if (data.count === 0) {
        throw new Error(MESSAGES.NO_PROGRAMS);
      }
      
      data.results.sort((a, b) => a.label_fr.localeCompare(b.label_fr));
      
      formationSelect.innerHTML = '<option value="" selected disabled>Choisissez votre formation</option>';
      data.results.forEach(formation => {
        const option = document.createElement('option');
        option.value = formation.code;
        option.textContent = formation.label_fr;
        formationSelect.appendChild(option);
      });
      
      formationSelect.disabled = false;
      console.log('Formations chargées avec succès');
    } catch (err) {
      console.error('Erreur chargement formations:', err);
      formationSelect.innerHTML = `<option value="" selected disabled>${err.message}</option>`;
      showAlert(messageDiv, 'danger', err.message);
    }
  });

  // Soumission du formulaire
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Soumission du formulaire');
    
    if (!etablissementSelect.value || !formationSelect.value) {
      console.warn('Validation échouée: établissement ou formation non sélectionné');
      showAlert(messageDiv, 'danger', MESSAGES.SELECT_INSTITUTION);
      return;
    }
    
    const selectedEtablissement = etablissementSelect.options[etablissementSelect.selectedIndex].text;
    const selectedFormation = formationSelect.options[formationSelect.selectedIndex].text;
    
    const consultationData = {
      etablissement: selectedEtablissement,
      etablissementCode: etablissementSelect.value,
      formation: selectedFormation,
      formationCode: formationSelect.value
    };
    
    console.log('Données à sauvegarder:', consultationData);
    sessionStorage.setItem('consultationData', JSON.stringify(consultationData));
    
    console.log('Redirection vers:', ROUTES.NOTES);
    window.location.href = ROUTES.NOTES;
  });
});