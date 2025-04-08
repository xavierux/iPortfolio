// i18n.js
async function loadLanguage(lang = 'en') {
    try {
      const response = await fetch(`assets/lang/${lang}.json`);
      const translations = await response.json();
      applyTranslations(translations);
    } catch (error) {
      console.error('Error loading language file:', error);
    }
  }
  
  function applyTranslations(translations) {
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const value = getNestedValue(translations, key);
      if (value) {
        element.textContent = value;
      }
    });
  
    // Special case for title
    const titleElement = document.querySelector('title[data-i18n]');
    if (titleElement) {
      document.title = getNestedValue(translations, titleElement.getAttribute('data-i18n'));
    }
  
    // Special case for typed items in hero section
    const typedElement = document.querySelector('.typed');
    if (typedElement) {
      const roles = getNestedValue(translations, 'hero.roles');
      typedElement.setAttribute('data-typed-items', roles);
      // Reinitialize Typed.js if needed
      if (typeof Typed !== 'undefined') {
        new Typed('.typed', {
          strings: roles.split(', '),
          typeSpeed: 100,
          backSpeed: 50,
          loop: true
        });
      }
    }
  }
  
  function getNestedValue(obj, key) {
    return key.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);
  }
  
  // Language switcher (example)
  function setLanguage(lang) {
    loadLanguage(lang);
  }
  
  // Load default language (English)
  document.addEventListener('DOMContentLoaded', () => {
    loadLanguage('en');
  });
  
  // Example: Add a language switcher in your HTML
  // <select onchange="setLanguage(this.value)">
  //   <option value="en">English</option>
  //   <option value="es">Español</option>
  // </select>