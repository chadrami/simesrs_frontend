// js/i18n.js
export const translations = {
  fr: {
    title: "Consultation des Notes - MESRS",
    platformTitle: "Plateforme des Étudiantes de l'Enseignement Supérieur",
    academicYear: "Année Universitaire 2025-2026",
    selectFormation: "Sélection de la Formation",
    institution: "Établissement",
    selectInstitution: "Choisissez votre établissement",
    program: "Formation",
    selectProgramFirst: "Choisissez d'abord un établissement",
    viewGrades: "Consulter les notes",
    loading: "Chargement en cours...",
    noInstitutions: "Aucun établissement disponible",
    noPrograms: "Aucune formation disponible pour cet établissement",
    selectInstitutionFirst: "Veuillez sélectionner un établissement et une formation",
    disputeNotice: "En cas de désaccord avec les notes affichées, veuillez vous rapprocher du service scolarité de votre établissement dans un délai de 15 jours suivant la publication pour toute réclamation. Passé ce délai, les notes seront considérées comme définitives.",
    rank: "Rang",
    name: "Nom et Prénom",
    average: "Moyenne",
    ministryName: "Ministère de l'Enseignement Supérieur et de la Recherche Scientifique",
    copyright: "© 2025 MESRS - Tous droits réservés",
    arabicBtn: "العربية",
    frenchBtn: "Français",
    errorLoadingData: "Une erreur est survenue lors du chargement des données"
  },
  ar: {
    title: "استشارة النتائج - وزارة التعليم العالي",
    platformTitle: "منصة طلاب التعليم العالي",
    academicYear: "السنة الجامعية 2025-2026",
    selectFormation: "اختيار التكوين",
    institution: "المؤسسة",
    selectInstitution: "اختر مؤسستك",
    program: "التكوين",
    selectProgramFirst: "اختر مؤسسة أولا",
    viewGrades: "استشارة النتائج",
    loading: "جاري التحميل...",
    noInstitutions: "لا توجد مؤسسات متاحة",
    noPrograms: "لا توجد تكوينات متاحة لهذه المؤسسة",
    selectInstitutionFirst: "الرجاء اختيار مؤسسة وتكوين",
    disputeNotice: "في حالة الخلاف على النتائج المعروضة، يرجى الاتصال بمصلحة التربية لمؤسستك في غضون 15 يومًا من النشر لأي مطالبة. بعد هذه الفترة، سيتم اعتبار النتائج نهائية.",
    rank: "الرتبة",
    name: "الاسم واللقب",
    average: "المعدل",
    ministryName: "وزارة التعليم العالي والبحث العلمي",
    copyright: "© 2025 وزارة التعليم العالي - جميع الحقوق محفوظة",
    arabicBtn: "العربية",
    frenchBtn: "Français",
    errorLoadingData: "حدث خطأ أثناء تحميل البيانات"
  }
};

export function setLanguage(lang) {
  localStorage.setItem('preferredLanguage', lang);
  applyTranslations(lang);
}

export function getPreferredLanguage() {
  return localStorage.getItem('preferredLanguage') || 'fr';
}

export function applyTranslations(lang) {
  const translation = translations[lang];
  if (!translation) return;

  document.documentElement.lang = lang;
  
  // Éléments communs
  document.title = translation.title;
  
  const platformTitle = document.querySelector('.platform-title');
  if (platformTitle) platformTitle.textContent = translation.platformTitle;
  
  const academicYear = document.querySelector('.academic-year');
  if (academicYear) academicYear.textContent = translation.academicYear;

  // Éléments spécifiques à index.html
  const selectionTitle = document.querySelector('.selection-title');
  if (selectionTitle) selectionTitle.textContent = translation.selectFormation;
  
  const institutionLabel = document.querySelector('label[for="input-etablissement"]');
  if (institutionLabel) institutionLabel.textContent = translation.institution;
  
  const programLabel = document.querySelector('label[for="input-formation"]');
  if (programLabel) programLabel.textContent = translation.program;
  
  const submitBtn = document.getElementById('submit-btn');
  if (submitBtn) {
    const span = submitBtn.querySelector('span');
    if (span) span.textContent = translation.viewGrades;
  }

  // Éléments spécifiques à notes.html
  const thElements = document.querySelectorAll('th');
  if (thElements.length > 0) {
    thElements[0].textContent = translation.rank;
    thElements[1].textContent = translation.name;
    thElements[2].textContent = translation.average;
  }
  
  const disputeNotice = document.getElementById('dispute-notice-text');
  if (disputeNotice) disputeNotice.textContent = translation.disputeNotice;

  // Footer
  const ministryName = document.querySelector('.ministry-name');
  if (ministryName) ministryName.textContent = translation.ministryName;
  
  const copyright = document.querySelector('.copyright');
  if (copyright) copyright.textContent = translation.copyright;
  
  // Bouton de changement de langue
  const languageSwitcher = document.getElementById('language-switcher');
  if (languageSwitcher) {
    const span = languageSwitcher.querySelector('span');
    if (span) span.textContent = lang === 'fr' ? translation.arabicBtn : translation.frenchBtn;
  }
}