// Icon paths mapping
const ICONS = {
  home: 'https://shared-assets.lumaris.fr.eu.org/assets/icons/home.svg',
  grid: 'https://shared-assets.lumaris.fr.eu.org/assets/icons/grid.svg',
  sparkles: 'https://shared-assets.lumaris.fr.eu.org/assets/icons/sparkles.svg',
  'study-notes': 'https://shared-assets.lumaris.fr.eu.org/assets/icons/study-notes.svg',
  web: 'https://shared-assets.lumaris.fr.eu.org/assets/icons/web.svg',
  database: 'https://shared-assets.lumaris.fr.eu.org/assets/icons/database.svg',
  wrench: 'https://shared-assets.lumaris.fr.eu.org/assets/icons/wrench.svg',
  settings: 'https://shared-assets.lumaris.fr.eu.org/assets/icons/settings.svg',
  refresh: 'https://shared-assets.lumaris.fr.eu.org/assets/icons/refresh.svg',
  logout: 'https://shared-assets.lumaris.fr.eu.org/assets/icons/logout.svg',
  more: 'https://shared-assets.lumaris.fr.eu.org/assets/icons/more.svg',
  folder: 'https://shared-assets.lumaris.fr.eu.org/assets/icons/folder.svg',
  customization: 'https://shared-assets.lumaris.fr.eu.org/assets/icons/personalization.svg',
  file: 'https://shared-assets.lumaris.fr.eu.org/assets/icons/file.svg',
  download: 'https://shared-assets.lumaris.fr.eu.org/assets/icons/download.svg',
  homework: 'https://shared-assets.lumaris.fr.eu.org/assets/icons/homework.svg',
  calendar: 'https://shared-assets.lumaris.fr.eu.org/assets/icons/calendar.svg',
  clock: 'https://shared-assets.lumaris.fr.eu.org/assets/icons/clock.svg',
  calculator: 'https://shared-assets.lumaris.fr.eu.org/assets/icons/calculator.svg',
  converter: 'https://shared-assets.lumaris.fr.eu.org/assets/icons/converter.svg',
  code: 'https://shared-assets.lumaris.fr.eu.org/assets/icons/code.svg',
  statistics: 'https://shared-assets.lumaris.fr.eu.org/assets/icons/statistics.svg',
  upload: 'https://shared-assets.lumaris.fr.eu.org/assets/icons/upload.svg',
  'chat-settings': 'https://shared-assets.lumaris.fr.eu.org/assets/icons/chat-settings.svg',
  chat: 'https://shared-assets.lumaris.fr.eu.org/assets/icons/chat.svg',
  checkmark: 'https://shared-assets.lumaris.fr.eu.org/assets/icons/checkmark.svg',
  'eye-open': 'https://shared-assets.lumaris.fr.eu.org/assets/icons/eye-open.svg',
  'eye-closed': 'https://shared-assets.lumaris.fr.eu.org/assets/icons/eye-closed.svg',
  subjects: 'https://shared-assets.lumaris.fr.eu.org/assets/icons/subjects.svg',
  swap: 'https://shared-assets.lumaris.fr.eu.org/assets/icons/swap.svg',
  play: 'https://shared-assets.lumaris.fr.eu.org/assets/icons/play.svg',
  copy: 'https://shared-assets.lumaris.fr.eu.org/assets/icons/copy.svg',
  'arrow-left': 'https://shared-assets.lumaris.fr.eu.org/assets/icons/arrow-left.svg',
  'arrow-right': 'https://shared-assets.lumaris.fr.eu.org/assets/icons/arrow-right.svg',
  send: 'https://shared-assets.lumaris.fr.eu.org/assets/icons/send.svg',
  warning: 'https://shared-assets.lumaris.fr.eu.org/assets/icons/warning.svg',
};

/**
 * Load icons via fetch and inject SVG content
 * @param {string|Element} selectorOrContainer - CSS selector or container element
 * @param {Object} customIcons - Optional custom icon mapping
 */
export async function loadIcons(selectorOrContainer = '[data-icon]', customIcons = null) {
  const iconMap = customIcons || ICONS;
  const container = typeof selectorOrContainer === 'string' 
    ? document 
    : selectorOrContainer;
  const selector = typeof selectorOrContainer === 'string' 
    ? selectorOrContainer 
    : '[data-icon]';
  
  const iconElements = container.querySelectorAll(selector);
  
  for (const element of iconElements) {
    const iconUrl = element.dataset.icon;
    if (!iconUrl) continue;
    
    try {
      const response = await fetch(iconUrl);
      const svgContent = await response.text();
      element.innerHTML = svgContent;
      
      // Set SVG size if needed
      const svg = element.querySelector('svg');
      if (svg) {
        const width = element.dataset.iconWidth;
        const height = element.dataset.iconHeight;
        if (width) svg.setAttribute('width', width);
        if (height) svg.setAttribute('height', height);
      }
    } catch (error) {
      console.error(`Failed to load icon ${iconUrl}:`, error);
    }
  }
}

/**
 * Get icon path by name
 * @param {string} name - Icon name
 * @returns {string} Icon path
 */
export function getIconPath(name) {
  return ICONS[name] || null;
}

export { ICONS };
