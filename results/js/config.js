// js/config.js
export const API_CONFIG = {
  BASE_URL: 'http://localhost:18000/api',
  ENDPOINTS: {
    INSTITUTIONS: '/config/institutions/',
    DEGREE_PROGRAMS: '/degreeprogram/institutions',
    FIRST_CYCLE_PROGRAMS: '/first-cycle-programs/',
    PROGRAM_RANKING: '/student/first-cycle-programs/' // Nouveau endpoint
  }
};

export const ROUTES = {
  HOME: 'index.html',
  NOTES: 'notes.html'
};