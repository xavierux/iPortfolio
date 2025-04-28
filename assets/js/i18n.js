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
    if (roles) {
      typedElement.setAttribute('data-typed-items', roles);
      // Dispatch an event to notify that the typed items have changed
      const event = new Event('typedItemsUpdated');
      typedElement.dispatchEvent(event);
    }
  }
}

function getNestedValue(obj, key) {
  return key.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);
}

// Language switcher
function setLanguage(lang) {
  localStorage.setItem("language", lang); // Save the selected language
  loadLanguage(lang);
}

// Load language from localStorage or default to English
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem("language") || "en";
  loadLanguage(savedLang);
  // Set the select element to the saved language
  const langSelect = document.querySelector('select[onchange="setLanguage(this.value)"]');
  if (langSelect) {
    langSelect.value = savedLang;
  }
});