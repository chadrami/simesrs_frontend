// Configuration des API backend
export const API_CONFIG = {
  BASE_URL: 'http://localhost:18000/api',
  ENDPOINTS: {
    // Configuration des établissements
    INSTITUTIONS: '/config/institutions/',
    
    // Configuration des formations
    DEGREE_PROGRAMS: '/degreeprogram/institutions',
    FIRST_CYCLE_PROGRAMS: '/first-cycle-programs/'
  }
};

// Chemins des pages
export const ROUTES = {
  HOME: 'index.html',
  NOTES: 'notes.html'
};

// Messages constants
export const MESSAGES = {
  LOADING: 'Chargement en cours...',
  NO_INSTITUTIONS: 'Aucun établissement disponible',
  NO_PROGRAMS: 'Aucune formation disponible pour cet établissement',
  SELECT_INSTITUTION: 'Veuillez sélectionner un établissement et une formation',
  DISPUTE_NOTICE: 'En cas de désaccord avec les notes affichées, veuillez vous rapprocher du service scolarité de votre établissement dans un délai de 15 jours suivant la publication pour toute réclamation. Passé ce délai, les notes seront considérées comme définitives.'
};