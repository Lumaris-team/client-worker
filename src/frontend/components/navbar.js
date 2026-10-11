import { appendAuthParams, logout } from "/lib/auth.js";

const NAV_ITEMS = [
  { slug: "home", label: "Home", href: "/pages/home", icon: "home" },
  { slug: "workspace", label: "Workspace", href: "/pages/workspace", icon: "grid" },
  { slug: "AI", label: "AI", href: "/pages/ai", icon: "sparkles" },
  { slug: "study-notes", label: "Study Notes", href: "/pages/study-notes", icon: "study-notes" },
  { slug: "websites", label: "Websites", href: "/pages/websites", icon: "web" },
  { slug: "files", label: "Files", href: "/pages/files", icon: "database" },
  { slug: "tools", label: "Tools", href: "/pages/tools", icon: "wrench" },
];
 
const ICONS = {
  home: '/assets/icons/home.svg',
  grid: '/assets/icons/grid.svg',
  sparkles: '/assets/icons/sparkles.svg',
  'study-notes': '/assets/icons/study-notes.svg',
  web: '/assets/icons/web.svg',
  database: '/assets/icons/database.svg',
  wrench: '/assets/icons/wrench.svg',
  settings: '/assets/icons/settings.svg',
  refresh: '/assets/icons/refresh.svg',
  logout: '/assets/icons/logout.svg',
  more: '/assets/icons/more.svg',
};

const NAVBAR_STYLE = `
  :host {
    position: fixed;
    inset: 10px 14px auto 14px;
    z-index: 1200;
    display: block;
    color: #edf5f2;
    box-sizing: border-box;
    pointer-events: none;
  }

  .bar {
    min-height: 42px;
    padding: 6px 12px;
    border-radius: 24px;
    border: 1px solid transparent;
    background: rgba(8, 9, 18, 0.28);
    backdrop-filter: blur(22px) saturate(1.15);
    -webkit-backdrop-filter: blur(22px) saturate(1.15);
    box-shadow:
      0 10px 40px rgba(0, 0, 0, 0.18),
      0 0 34px rgba(146, 116, 255, 0.08),
      0 0 0 1px rgba(255, 255, 255, 0.04) inset,
      0 1px 0 rgba(255, 255, 255, 0.08) inset;
    pointer-events: auto;
    overflow: hidden;
    position: relative;
  }

  .bar::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    box-shadow: inset 0 0 24px rgba(255, 255, 255, 0.03);
    mask-image: radial-gradient(ellipse 120% 100% at 50% 0%, #000 55%, transparent 100%);
  }

  .inner {
    width: 100%;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
    position: relative;
    z-index: 1;
  }

  .center {
    min-width: 0;
    overflow: hidden;
  }

  .brand,
  .action,
  .feature,
  .quick {
    border: 1px solid transparent;
    border-radius: 999px;
    background: transparent;
    color: inherit;
    cursor: pointer;
    text-decoration: none;
    transition:
      background 180ms ease,
      border-color 180ms ease,
      transform 180ms ease,
      color 180ms ease;
  }

  .brand {
    display: inline-flex;
    align-items: center;
    padding: 4px 0;
    border-color: transparent;
    background: transparent;
    flex-shrink: 0;
    grid-column: 1;
    justify-self: start;
    border-radius: 999px;
  }

  .brand:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: transparent;
  }

  .action:hover,
  .feature:hover,
  .quick:hover {
    background: transparent;
    border-color: transparent;
  }

  .brand:active,
  .action:active,
  .feature:active,
  .quick:active {
    transform: translateY(1px);
  }

  .brand-icon {
    width: 52px;
    height: 44px;
    object-fit: contain;
    object-position: center;
    display: block;
    transform: scale(1);
    transform-origin: center;
    border-radius: 999px;
    clip-path: inset(0 round 999px);
  }

  .center {
    grid-column: 2;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    justify-self: stretch;
    overflow: hidden;
  }

  .center-scroll {
    min-width: 0;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;
    outline: none;
  }

  .center-scroll::-webkit-scrollbar {
    display: none;
  }

  .feature-list {
    position: relative;
    display: flex;
    flex-wrap: nowrap;
    justify-content: flex-start;
    gap: 8px;
    width: max-content;
    margin: 0;
  }

  .nav-indicator {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
    width: 0;
    height: 0;
    border-radius: 999px;
    background: rgba(140, 236, 255, 0.16);
    box-shadow:
      0 0 26px rgba(140, 236, 255, 0.14),
      0 0 0 1px rgba(140, 236, 255, 0.04) inset;
    opacity: 0;
    pointer-events: none;
    z-index: 0;
    transform: translate3d(0, 0, 0);
    transition:
      transform 360ms cubic-bezier(0.22, 1, 0.36, 1),
      width 360ms cubic-bezier(0.22, 1, 0.36, 1),
      height 360ms cubic-bezier(0.22, 1, 0.36, 1),
      opacity 180ms ease;
  }

  .nav-indicator[data-hovering="true"] {
    opacity: 0.42;
  }

  .nav-indicator[data-hovering="false"] {
    opacity: 1;
  }

  .center[data-labels="hidden"] .feature-label,
  .center[data-labels="hidden"] .feature em {
    display: none;
  }

  .feature {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 999px;
    border-color: transparent;
    background: transparent;
    color: rgba(237, 245, 242, 0.82);
    flex-shrink: 0;
  }

  .feature[data-active="true"] {
    background: transparent;
    border-color: transparent;
    color: #f4fbf8;
  }

  .feature-icon,
  .action-icon {
    width: 32px;
    height: 32px;
    display: inline-grid;
    place-items: center;
    flex: 0 0 auto;
    overflow: hidden;
    border-radius: 999px;
  }

  .brand-icon-wrap {
    width: 60px;
    height: 52px;
    display: inline-grid;
    place-items: center;
    overflow: hidden;
    flex: 0 0 auto;
    border-radius: 999px;
    background: transparent;
  }

  .feature-icon img,
  .action-icon img,
  .feature-icon object,
  .action-icon object {
    width: 20px;
    height: 20px;
  }

  .feature-icon svg,
  .action-icon svg {
    width: 20px;
    height: 20px;
    stroke: currentColor;
    fill: none;
    clip-path: inset(0 round 999px);
  }

  .feature-label,
  .quick span {
    font-size: 0.85rem;
    white-space: nowrap;
  }

  .feature em {
    font-style: normal;
    color: rgba(237, 245, 242, 0.58);
    font-size: 0.74rem;
  }

  .right {
    grid-column: 3;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    justify-self: end;
    gap: 8px;
    flex-shrink: 0;
    padding-right: 2px;
    min-width: 104px;
  }

  .action,
  .quick {
    min-width: 0;
    min-height: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 999px;
    border-color: transparent;
    background: transparent;
    color: rgba(237, 245, 242, 0.82);
  }

  .action[aria-label] {
    position: relative;
  }

  .quick[data-cooldown="true"] {
    opacity: 0.3;
    filter: grayscale(1);
    pointer-events: none;
    cursor: not-allowed;
  }

  @keyframes navbar-refresh-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .quick[data-refreshing="true"] .action-icon svg,
  .quick[data-refreshing="true"] .action-icon img {
    animation: navbar-refresh-spin 1s linear infinite;
  }

  .action-label {
    display: none;
  }

  /* Kebab (three dots) is only used on small screens. */
  .more-toggle {
    display: none;
  }

  .more-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    min-width: 184px;
    display: none;
    flex-direction: column;
    gap: 6px;
    padding: 8px;
    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(8, 9, 18, 0.55);
    backdrop-filter: blur(22px) saturate(1.15);
    -webkit-backdrop-filter: blur(22px) saturate(1.15);
    box-shadow:
      0 18px 50px rgba(0, 0, 0, 0.35),
      0 0 0 1px rgba(255, 255, 255, 0.04) inset;
    pointer-events: auto;
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
    visibility: hidden;
    transition:
      opacity 200ms ease,
      transform 200ms ease,
      visibility 200ms ease;
    z-index: 2;
  }

  .more-menu[data-open="true"] {
    opacity: 1;
    transform: translateY(0) scale(1);
    visibility: visible;
  }

  .more-item {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.03);
    color: rgba(237, 245, 242, 0.9);
    cursor: pointer;
    text-decoration: none;
    text-align: left;
    font: inherit;
    transition:
      background 160ms ease,
      border-color 160ms ease;
  }

  .more-item:hover {
    background: transparent;
    border-color: transparent;
  }

  .more-item:active {
    transform: translateY(1px);
  }

  .more-item .action-icon {
    width: 22px;
    height: 22px;
  }

  .more-item .action-icon svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }

  .more-item-label {
    font-size: 0.9rem;
    white-space: nowrap;
  }

  @media (max-width: 640px) {
    :host {
      inset: 8px 10px auto 10px;
    }

    .right .quick:not(.more-toggle) {
      display: none;
    }

    .more-toggle {
      display: inline-flex;
    }

    .more-menu {
      display: flex;
    }

    .bar {
      min-height: 48px;
      padding: 10px 10px;
      border-radius: 20px;
    }

    .feature-label {
      display: none;
    }

    .feature em {
      display: none;
    }

    .feature {
      padding: 8px 12px;
    }

    .brand {
      padding-right: 8px;
      padding-left: 0;
    }
  }
`;

async function iconFor(name) {
  const url = ICONS[name] || ICONS.grid;
  try {
    const response = await fetch(url);
    const svgContent = await response.text();
    return svgContent;
  } catch (error) {
    console.error('Error loading icon:', error);
    return '';
  }
}

const NAVBAR_TEMPLATE = `
  <div class="bar">
    <div class="inner">
      <a class="brand" data-home-link href="/pages/home" aria-label="Go to home">
        <span class="brand-icon-wrap">
          <img class="brand-icon" src="/assets/logo/logo.png" alt="Dashboard">
        </span>
      </a>

      <div class="center" role="navigation" aria-label="Feature navigation">
        <div class="center-scroll" data-center-scroll tabindex="0">
          <div class="feature-list">
            ${NAV_ITEMS.map((item) => `
              <a class="feature" data-route="${item.slug}" href="${item.href}">
                <span class="feature-icon" data-icon="${ICONS[item.icon] || ICONS.grid}"></span>
                <span class="feature-label">${item.label}</span>
              </a>
            `).join("")}
          </div>
        </div>
      </div>

      <div class="right">
        <button class="quick" data-kind="refresh" type="button" aria-label="Refresh page">
          <span class="action-icon" data-icon="${ICONS.refresh}"></span>
        </button>

        <a class="quick" data-kind="settings" href="/pages/settings" aria-label="Open settings">
          <span class="action-icon" data-icon="${ICONS.settings}"></span>
        </a>
        <button class="quick" data-kind="logout" type="button" aria-label="Log out">
          <span class="action-icon" data-icon="${ICONS.logout}"></span>
        </button>
        <button class="quick more-toggle" data-kind="more" type="button" aria-label="More options" aria-expanded="false">
          <span class="action-icon" data-icon="${ICONS.more}"></span>
        </button>
      </div>
    </div>
    <span class="nav-indicator" data-hovering="false" aria-hidden="true"></span>
  </div>

  <div class="more-menu" data-more-menu data-open="false" aria-hidden="true">
    <button class="more-item" data-kind="refresh" type="button">
      <span class="action-icon" data-icon="${ICONS.refresh}"></span>
      <span class="more-item-label">Refresh</span>
    </button>

    <a class="more-item" data-kind="settings" href="/pages/settings">
      <span class="action-icon" data-icon="${ICONS.settings}"></span>
      <span class="more-item-label">Settings</span>
    </a>
    <button class="more-item" data-kind="logout" type="button">
      <span class="action-icon" data-icon="${ICONS.logout}"></span>
      <span class="more-item-label">Log out</span>
    </button>
  </div>
`;

class SiteNavbar extends HTMLElement {
  static observedAttributes = ["current"];

  constructor() {
    super();
    this._resizeObserver = null;
    this._centerScrollObserver = null;
    this._centerScrollCleanup = null;
    this._boundUpdateHeight = this._updateHeight.bind(this);
    this._boundAction = this._handleAction.bind(this);
    this._boundDocClick = this._handleDocumentClick.bind(this);
    this._boundFeatureEnter = this._handleFeatureEnter.bind(this);
    this._boundFeatureLeave = this._handleFeatureLeave.bind(this);
    this._featureIndicatorCleanup = null;
    this._refreshCooldownTimer = null;
  }

  static REFRESH_COOLDOWN_MS = 10000;

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.innerHTML = `<style>${NAVBAR_STYLE}</style>${NAVBAR_TEMPLATE}`;
      this.shadowRoot.querySelector("[data-home-link]").addEventListener("click", (event) => {
        event.preventDefault();
        window.location.href = appendAuthParams("/pages/home");
      });
      this.shadowRoot.querySelectorAll("[data-route]").forEach((item) => {
        item.addEventListener("click", (event) => {
          event.preventDefault();
          window.location.href = appendAuthParams(item.getAttribute("href"));
        });
      });
      // One delegated handler for refresh / settings / logout / more, shared by
      // the inline buttons and the kebab menu (matched by data-kind).
      this.shadowRoot.querySelectorAll("[data-kind]").forEach((item) => {
        item.addEventListener("click", this._boundAction);
      });
      document.addEventListener("click", this._boundDocClick);
      
      // Load icons
      this._loadIcons();
      this._setupFeatureIndicator();
    }

    this._syncActiveState();
    this._observeHeight();
    this._setupCenterScroll();
    this._updateHeight();
  }

  _handleAction(event) {
    const kind = event.currentTarget?.dataset?.kind;
    if (!kind) return;
    event.preventDefault();
    switch (kind) {
      case "more":
        this._toggleMoreMenu();
        return;
      case "refresh":
        this._closeMoreMenu();
        this._handleRefresh();
        return;
      case "settings":
        this._closeMoreMenu();
        window.location.href = appendAuthParams("/pages/settings");
        return;
      case "chat":
        this._closeMoreMenu();
        window.location.href = appendAuthParams("/pages/chat");
        return;
      case "logout":
        this._closeMoreMenu();
        logout();
        return;
      default:
    }
  }

  _toggleMoreMenu() {
    const menu = this.shadowRoot?.querySelector("[data-more-menu]");
    const toggle = this.shadowRoot?.querySelector(".more-toggle");
    if (!menu) return;
    const open = menu.dataset.open !== "true";
    menu.dataset.open = open ? "true" : "false";
    menu.setAttribute("aria-hidden", open ? "false" : "true");
    toggle?.setAttribute("aria-expanded", open ? "true" : "false");
  }

  _closeMoreMenu() {
    const menu = this.shadowRoot?.querySelector("[data-more-menu]");
    const toggle = this.shadowRoot?.querySelector(".more-toggle");
    if (!menu || menu.dataset.open !== "true") return;
    menu.dataset.open = "false";
    menu.setAttribute("aria-hidden", "true");
    toggle?.setAttribute("aria-expanded", "false");
  }

  // Close the kebab menu when clicking anywhere outside the navbar.
  _handleDocumentClick(event) {
    if (event.composedPath().includes(this)) return;
    this._closeMoreMenu();
  }

  disconnectedCallback() {
    document.removeEventListener("click", this._boundDocClick);
    if (this._refreshCooldownTimer) {
      clearTimeout(this._refreshCooldownTimer);
      this._refreshCooldownTimer = null;
    }
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    if (this._centerScrollObserver) {
      this._centerScrollObserver.disconnect();
      this._centerScrollObserver = null;
    }
    if (this._centerScrollCleanup) {
      this._centerScrollCleanup();
      this._centerScrollCleanup = null;
    }
    if (this._featureIndicatorCleanup) {
      this._featureIndicatorCleanup();
      this._featureIndicatorCleanup = null;
    }
  }

  async _loadIcons() {
    const iconElements = this.shadowRoot.querySelectorAll('[data-icon]');
    for (const element of iconElements) {
      const iconUrl = element.dataset.icon;
      if (!iconUrl) continue;
      
      try {
        const response = await fetch(iconUrl);
        const svgContent = await response.text();
        element.innerHTML = svgContent;
      } catch (error) {
        console.error('Error loading icon:', iconUrl, error);
      }
    }
  }

  attributeChangedCallback() {
    this._syncActiveState();
  }

  _syncActiveState() {
    const current = this.getAttribute("current") || "home";
    this.shadowRoot?.querySelectorAll("[data-route]").forEach((item) => {
      item.dataset.active = String(item.dataset.route === current);
    });
    this._moveFeatureIndicator(this.shadowRoot?.querySelector('[data-route][data-active="true"]'), false);
  }

  _setupFeatureIndicator() {
    const root = this.shadowRoot;
    const bar = root?.querySelector(".bar");
    if (!bar || this._featureIndicatorCleanup) return;

    const features = Array.from(bar.querySelectorAll("[data-route], [data-home-link], .quick"));
    const indicator = bar.querySelector(".nav-indicator");
    if (!indicator) return;

    features.forEach((feature) => feature.addEventListener("pointerenter", this._boundFeatureEnter));
    bar.addEventListener("pointerleave", this._boundFeatureLeave);

    this._featureIndicatorCleanup = () => {
      features.forEach((feature) => feature.removeEventListener("pointerenter", this._boundFeatureEnter));
      bar.removeEventListener("pointerleave", this._boundFeatureLeave);
    };

    requestAnimationFrame(() => {
      this._moveFeatureIndicator(root.querySelector('[data-route][data-active="true"]'), false);
    });
  }

  _handleFeatureEnter(event) {
    this._moveFeatureIndicator(event.currentTarget, true);
  }

  _handleFeatureLeave() {
    this._moveFeatureIndicator(
      this.shadowRoot?.querySelector('[data-route][data-active="true"]'),
      false,
    );
  }

  _moveFeatureIndicator(feature, hovering) {
    const indicator = this.shadowRoot?.querySelector(".nav-indicator");
    const bar = this.shadowRoot?.querySelector(".bar");
    if (!indicator || !bar || !feature) return;

    const barRect = bar.getBoundingClientRect();
    const featureRect = feature.getBoundingClientRect();

    indicator.dataset.hovering = String(hovering);
    indicator.style.width = `${featureRect.width}px`;
    indicator.style.height = `${featureRect.height}px`;
    indicator.style.transform = `translate3d(${featureRect.left - barRect.left}px, ${featureRect.top - barRect.top}px, 0)`;
  }

  _observeHeight() {
    if (this._resizeObserver) return;
    this._resizeObserver = new ResizeObserver(this._boundUpdateHeight);
    this._resizeObserver.observe(this);
  }

  _setupCenterScroll() {
    const root = this.shadowRoot;
    if (!root || this._centerScrollCleanup) return;

    const center = root.querySelector(".center");
    if (!center) return;

    const LABELS_HIDE_WIDTH = 760;

    const updateLabelsState = () => {
      const availableWidth = this.getBoundingClientRect().width;
      center.dataset.labels = availableWidth <= LABELS_HIDE_WIDTH ? "hidden" : "visible";
      this._moveFeatureIndicator(center.querySelector('[data-route][data-active="true"]'), false);
      this._updateHeight();
    };

    this._centerScrollObserver = new ResizeObserver(updateLabelsState);
    this._centerScrollObserver.observe(this);

    window.addEventListener("resize", updateLabelsState);
    updateLabelsState();

    this._centerScrollCleanup = () => {
      this._centerScrollObserver?.disconnect();
      this._centerScrollObserver = null;
      window.removeEventListener("resize", updateLabelsState);
    };
  }

  _updateHeight() {
    const height = Math.ceil(this.getBoundingClientRect().height || 72);
    document.documentElement.style.setProperty("--navbar-height", `${height}px`);
    document.body?.style.setProperty("--navbar-height", `${height}px`);
  }

  _handleRefresh() {
    // There can be two refresh controls (inline button + kebab menu item).
    const buttons = Array.from(this.shadowRoot?.querySelectorAll("[data-kind='refresh']") || []);
    const inline = buttons.find((b) => !b.classList.contains("more-item")) || buttons[0];
    if (inline) {
      if (inline.dataset.cooldown === "true") return;
      for (const b of buttons) {
        b.dataset.cooldown = "true";
        b.dataset.refreshing = "true";
        b.disabled = true;
        b.setAttribute("aria-disabled", "true");
      }
      if (this._refreshCooldownTimer) clearTimeout(this._refreshCooldownTimer);
      this._refreshCooldownTimer = setTimeout(() => {
        for (const b of buttons) {
          b.dataset.cooldown = "false";
          b.disabled = false;
          b.removeAttribute("aria-disabled");
        }
        this._refreshCooldownTimer = null;
      }, SiteNavbar.REFRESH_COOLDOWN_MS);
    }

    const pending = [];
    const detail = {
      current: this.getAttribute("current") || "home",
      waitUntil: (promise) => {
        if (promise) pending.push(Promise.resolve(promise));
      },
    };

    window.dispatchEvent(new CustomEvent("site-navbar:refresh", { detail }));
    document.dispatchEvent(new CustomEvent("site-navbar:refresh", { detail }));

    Promise.allSettled(pending).then(() => {
      for (const b of buttons) b.dataset.refreshing = "false";
    });
  }
}

if (!customElements.get("site-navbar")) {
  customElements.define("site-navbar", SiteNavbar);
}

// Load icons via fetch and inject as data URLs
async function loadNavbarIcons() {
  const placeholders = document.querySelectorAll('.icon-placeholder');
  
  for (const placeholder of placeholders) {
    const iconName = placeholder.dataset.icon;
    const iconPath = ICONS[iconName];
    
    if (iconPath) {
      try {
        const response = await fetch(iconPath);
        const svgContent = await response.text();
        const dataUrl = `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
        placeholder.innerHTML = `<img src="${dataUrl}" alt="" loading="lazy" />`;
      } catch (error) {
        console.error(`Failed to load icon ${iconName}:`, error);
        placeholder.innerHTML = `<span style="font-size:20px">⚠️</span>`;
      }
    }
  }
}

// Load icons when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadNavbarIcons);
} else {
  loadNavbarIcons();
}
