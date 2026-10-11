// Icon paths mapping
const ICONS = {
  home: 'https://shared-assets.danielersen.workers.dev/assets/icons/home.svg',
  grid: 'https://shared-assets.danielersen.workers.dev/assets/icons/grid.svg',
  sparkles: 'https://shared-assets.danielersen.workers.dev/assets/icons/sparkles.svg',
  'study-notes': 'https://shared-assets.danielersen.workers.dev/assets/icons/study-notes.svg',
  web: 'https://shared-assets.danielersen.workers.dev/assets/icons/web.svg',
  database: 'https://shared-assets.danielersen.workers.dev/assets/icons/database.svg',
  wrench: 'https://shared-assets.danielersen.workers.dev/assets/icons/wrench.svg',
  settings: 'https://shared-assets.danielersen.workers.dev/assets/icons/settings.svg',
  refresh: 'https://shared-assets.danielersen.workers.dev/assets/icons/refresh.svg',
  logout: 'https://shared-assets.danielersen.workers.dev/assets/icons/logout.svg',
  more: 'https://shared-assets.danielersen.workers.dev/assets/icons/more.svg',
  folder: 'https://shared-assets.danielersen.workers.dev/assets/icons/folder.svg',
  customization: 'https://shared-assets.danielersen.workers.dev/assets/icons/personalization.svg',
  file: 'https://shared-assets.danielersen.workers.dev/assets/icons/file.svg',
  download: 'https://shared-assets.danielersen.workers.dev/assets/icons/download.svg',
  homework: 'https://shared-assets.danielersen.workers.dev/assets/icons/homework.svg',
  calendar: 'https://shared-assets.danielersen.workers.dev/assets/icons/calendar.svg',
  clock: 'https://shared-assets.danielersen.workers.dev/assets/icons/clock.svg',
  calculator: 'https://shared-assets.danielersen.workers.dev/assets/icons/calculator.svg',
  converter: 'https://shared-assets.danielersen.workers.dev/assets/icons/converter.svg',
  code: 'https://shared-assets.danielersen.workers.dev/assets/icons/code.svg',
  statistics: 'https://shared-assets.danielersen.workers.dev/assets/icons/statistics.svg',
  upload: 'https://shared-assets.danielersen.workers.dev/assets/icons/upload.svg',
  'chat-settings': 'https://shared-assets.danielersen.workers.dev/assets/icons/chat-settings.svg',
  chat: 'https://shared-assets.danielersen.workers.dev/assets/icons/chat.svg',
  checkmark: 'https://shared-assets.danielersen.workers.dev/assets/icons/checkmark.svg',
  'eye-open': 'https://shared-assets.danielersen.workers.dev/assets/icons/eye-open.svg',
  'eye-closed': 'https://shared-assets.danielersen.workers.dev/assets/icons/eye-closed.svg',
  subjects: 'https://shared-assets.danielersen.workers.dev/assets/icons/subjects.svg',
  swap: 'https://shared-assets.danielersen.workers.dev/assets/icons/swap.svg',
  play: 'https://shared-assets.danielersen.workers.dev/assets/icons/play.svg',
  copy: 'https://shared-assets.danielersen.workers.dev/assets/icons/copy.svg',
  'arrow-left': 'https://shared-assets.danielersen.workers.dev/assets/icons/arrow-left.svg',
  'arrow-right': 'https://shared-assets.danielersen.workers.dev/assets/icons/arrow-right.svg',
  send: 'https://shared-assets.danielersen.workers.dev/assets/icons/send.svg',
  warning: 'https://shared-assets.danielersen.workers.dev/assets/icons/warning.svg',
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
