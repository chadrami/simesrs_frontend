// js/utils.js
/**
 * Affiche une alerte stylisée
 * @param {HTMLElement} container - Élément conteneur
 * @param {string} type - Type d'alerte (success, danger, warning)
 * @param {string} message - Message à afficher
 * @param {string} icon - Icône Bootstrap (optionnelle)
 */
export function showAlert(container, type, message, icon = null) {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} alert-dismissible fade show`;
  alert.role = 'alert';
  alert.innerHTML = `
    ${icon ? `<i class="bi bi-${icon} me-2"></i>` : ''}
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  // Vider le conteneur avant d'ajouter la nouvelle alerte
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  
  container.appendChild(alert);
  
  // Retourner la référence pour pouvoir la fermer programmatiquement si besoin
  return alert;
}

/**
 * Valide le format NNI
 */
export function validateNNI(nni) {
  return /^\d{10}$/.test(nni?.trim());
}

/**
 * Décodage sécurisé des paramètres URL
 */
export function decodeParam(param) {
  try {
    return param ? decodeURIComponent(param.replace(/\+/g, ' ')) : '';
  } catch {
    return param || '';
  }
}

/**
 * Formate une date en français ou arabe
 */
export function formatDate(dateString, lang = 'fr') {
  if (!dateString) return lang === 'fr' ? 'Date inconnue' : 'تاريخ غير معروف';
  
  let date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    const frenchFormat = dateString.match(/(\d{2})\/(\d{2})\/(\d{4}) à (\d{2}):(\d{2})/);
    if (frenchFormat) {
      const [_, day, month, year, hours, minutes] = frenchFormat;
      date = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`);
    }
  }
  
  if (isNaN(date.getTime())) {
    return dateString;
  }

  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit', 
    minute: '2-digit'
  };
  
  return date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'ar-MA', options);
}