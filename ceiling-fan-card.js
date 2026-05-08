/**
 * ceiling-fan-card — Home Assistant Lovelace Custom Card
 *
 * type: custom:ceiling-fan-card
 * entity: fan.my_ceiling_fan
 * name: מאוורר סלון
 * speed_names: [חלש מאוד, חלש, בינוני-חלש, בינוני, חזק, חזק מאוד]
 * extra_entity:
 *   entity: switch_timer.toggle_fan
 *   name: טיימר
 *   icon: mdi:camera-timer
 *   icon_color: teal
 *   tap_action:
 *     action: perform-action
 *     ...
 */

const CARD_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;600;700;800&display=swap');
  :host { display: block; font-family: 'Heebo', sans-serif; }

  ha-card {
    padding: 16px 16px 14px;
    position: relative;
    overflow: hidden;
    --fan-accent: var(--accent-color, #6366f1);
  }

  /* ── מצב לילה (ברירת מחדל) ── */
  :host {
    --fan-text: #e1e1e1;
    --fan-subtext: rgba(255,255,255,0.5);
    --fan-divider: rgba(255,255,255,0.15);
    --fan-bg2: rgba(255,255,255,0.06);
    --fan-disabled: rgba(255,255,255,0.25);
  }

  /* ── מצב יום ── */
  @media (prefers-color-scheme: light) {
    :host {
      --fan-text: #1a1a2e;
      --fan-subtext: #555577;
      --fan-divider: rgba(0,0,0,0.18);
      --fan-bg2: rgba(0,0,0,0.06);
      --fan-disabled: #9e9e9e;
    }
  }

  ha-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, var(--fan-accent), #0ea5e9, #06b6d4);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .title {
    font-size: 15px;
    font-weight: 800;
    color: var(--fan-text);
    line-height: 1;
  }

  .btns { display: flex; align-items: center; gap: 8px; }

  .icon-btn {
    width: 34px; height: 34px;
    border-radius: 50%;
    border: 1.5px solid var(--fan-divider);
    background: var(--fan-bg2);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all .3s;
    padding: 0;
  }

  .power-btn svg {
    width: 14px; height: 14px;
    stroke: var(--fan-subtext);
    fill: none; stroke-width: 2; stroke-linecap: round;
    transition: stroke .3s;
  }
  .power-btn.on {
    border-color: var(--fan-accent);
    box-shadow: 0 0 8px color-mix(in srgb, var(--fan-accent) 35%, transparent);
  }
  .power-btn.on svg { stroke: var(--fan-accent); }

  .extra-btn {
    border-color: rgba(245,158,11,0.5);
    background: rgba(245,158,11,0.1);
  }
  .extra-btn svg {
    width: 15px; height: 15px;
    fill: none; stroke: rgb(245,158,11);
    stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
  }

  .fan-center {
    display: flex; flex-direction: column;
    align-items: center; gap: 8px;
    margin-bottom: 12px; position: relative;
  }

  .fan-glow {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -54%);
    width: 120px; height: 120px; border-radius: 50%;
    background: radial-gradient(circle,
      color-mix(in srgb, var(--fan-accent) 18%, transparent),
      transparent 65%);
    opacity: 0; transition: opacity .5s; pointer-events: none;
  }
  .fan-glow.active { opacity: 1; }

  .fan-svg { width: 110px; height: 110px; }

  .speed-name {
    font-size: 18px; font-weight: 800;
    color: var(--fan-accent);
    transition: color .3s;
  }
  .speed-name.off {
    color: var(--fan-disabled);
    opacity: 0.6;
  }

  .controls {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 4px;
  }

  .spd-btn {
    border-radius: 8px;
    border: 1px solid var(--fan-divider);
    background: var(--fan-bg2);
    cursor: pointer; padding: 6px 2px 5px;
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    transition: all .2s;
  }
  .spd-btn:hover { border-color: var(--fan-accent); transform: translateY(-1px); }
  .spd-btn.active {
    border-color: var(--fan-accent);
    background: color-mix(in srgb, var(--fan-accent) 12%, var(--fan-bg2));
  }

  .btn-lbl {
    font-size: 11px; font-weight: 700;
    color: var(--fan-subtext);
    line-height: 1.15; text-align: center; direction: rtl;
    transition: color .2s;
  }
  .spd-btn.active .btn-lbl { color: var(--fan-accent); }

  .bars { display: flex; gap: 1.5px; align-items: flex-end; height: 10px; }
  .bar { width: 3px; border-radius: 2px; background: var(--fan-divider); transition: background .2s; }
  .spd-btn.active .bar { background: var(--fan-accent); }

  /* ── Preset dropdown ── */
  .preset-section { border-top: 1px solid var(--fan-divider); padding-top: 10px; margin-top: 4px; }

  .preset-trigger {
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 12px; border-radius: 10px;
    border: 1px solid var(--fan-divider);
    background: var(--fan-bg2);
    cursor: pointer; transition: all .2s; user-select: none;
  }
  .preset-trigger:hover { border-color: var(--fan-accent); }

  .preset-trigger-left { display: flex; align-items: center; gap: 8px; }
  .preset-trigger-icon { width: 18px; height: 18px; stroke: var(--fan-subtext); fill: none; stroke-width: 1.5; stroke-linecap: round; flex-shrink: 0; }
  .preset-selected { font-size: 13px; font-weight: 600; color: var(--fan-text); }
  .preset-arrow { width: 16px; height: 16px; stroke: var(--fan-subtext); fill: none; stroke-width: 2; stroke-linecap: round; transition: transform .2s; flex-shrink: 0; }
  .preset-arrow.open { transform: rotate(180deg); }

  .preset-list {
    margin-top: 4px; border-radius: 10px;
    border: 1px solid var(--fan-divider);
    background: var(--ha-card-background, var(--card-background-color));
    overflow: hidden; display: none;
  }
  .preset-list.open { display: block; }

  .preset-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 14px; cursor: pointer;
    border-bottom: 1px solid var(--fan-divider);
    transition: background .15s;
  }
  .preset-item:last-child { border: none; }
  .preset-item:hover { background: color-mix(in srgb, var(--fan-accent) 8%, transparent); }
  .preset-item.active { background: color-mix(in srgb, var(--fan-accent) 12%, transparent); }

  .preset-item-name { font-size: 13px; font-weight: 600; color: var(--fan-text); }
  .preset-item.active .preset-item-name { color: var(--fan-accent); }
  .preset-check { width: 14px; height: 14px; stroke: var(--fan-accent); fill: none; stroke-width: 2.5; stroke-linecap: round; opacity: 0; }
  .preset-item.active .preset-check { opacity: 1; }

  /* ── Entities list ── */
  .entities-section { border-top: 1px solid var(--fan-divider); padding-top: 8px; margin-top: 4px; }

  .entity-row {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 4px; border-radius: 8px; cursor: pointer;
    transition: background .15s;
    border-bottom: 1px solid var(--fan-divider);
  }
  .entity-row:last-child { border: none; }
  .entity-row:hover { background: color-mix(in srgb, var(--fan-accent) 5%, transparent); }

  .entity-icon-wrap {
    width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: var(--fan-bg2); border: 1px solid var(--fan-divider);
    transition: all .3s;
  }
  .entity-icon-wrap.on { background: color-mix(in srgb, var(--fan-accent) 15%, transparent); border-color: color-mix(in srgb, var(--fan-accent) 35%, transparent); }
  .entity-icon-wrap ha-icon { --mdc-icon-size: 18px; color: var(--fan-subtext); transition: color .3s; }
  .entity-icon-wrap.on ha-icon { color: var(--fan-accent); }

  .entity-info { flex: 1; min-width: 0; }
  .entity-name { font-size: 13px; font-weight: 600; color: var(--fan-text); line-height: 1.2; }
  .entity-state { font-size: 11px; color: var(--fan-subtext); margin-top: 1px; }
  .entity-state.on { color: var(--fan-accent); }

  .entity-toggle {
    width: 36px; height: 20px; border-radius: 10px;
    border: none; cursor: pointer; position: relative;
    transition: background .3s; flex-shrink: 0; padding: 0;
    background: var(--fan-divider);
  }
  .entity-toggle.on { background: var(--fan-accent); }
  .entity-toggle-thumb {
    width: 14px; height: 14px; border-radius: 50%; background: white;
    position: absolute; top: 3px; transition: left .3s;
    left: 3px;
  }
  .entity-toggle.on .entity-toggle-thumb { left: 19px; }

  .entity-chevron { width: 16px; height: 16px; flex-shrink: 0; stroke: var(--fan-subtext); fill: none; stroke-width: 2; stroke-linecap: round; }
`;

const DEFAULT_SPEED_NAMES = ['חלש מאוד', 'חלש', 'בינוני-חלש', 'בינוני', 'חזק', 'חזק מאוד'];
const TARGET_DURS = [3.5, 2.0, 1.2, 0.75, 0.45, 0.27];
const BLADE_OPS   = [[0.24,0.19],[0.28,0.22],[0.32,0.26],[0.38,0.30],[0.44,0.36],[0.52,0.44]];
const SPEED_PCT   = [17, 33, 50, 67, 83, 100];
const BAR_H       = [[4],[4,7],[4,7,9],[4,7,9,11],[4,7,9,11,13],[4,7,9,11,13,15]];

function defaultTapAction(domain) {
  const moreInfoDomains = ['select', 'input_select', 'number', 'input_number',
    'text', 'input_text', 'datetime', 'input_datetime', 'sensor', 'binary_sensor'];
  return moreInfoDomains.includes(domain) ? { action: 'more-info' } : { action: 'toggle' };
}

class CeilingFanCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._built = false;
    this._angle = 0;
    this._currentDur = TARGET_DURS[2];
    this._rafId = null;
    this._lastTs = null;
    this._decelerating = false;
    this._isOn = false;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._built) { this._build(); this._built = true; }
    this._sync();
  }

  setConfig(config) {
    if (!config.entity) throw new Error('entity is required');
    this._config     = config;
    this._entity     = config.entity;
    this._name       = config.name || null;
    this._speedNames = Array.isArray(config.speed_names) ? config.speed_names : DEFAULT_SPEED_NAMES;
    if (this._built) { this._built = false; this._build(); this._built = true; }
  }

  get _extra() { return this._config?.extra_entity || null; }

  getCardSize() { return 4; }
  static getConfigElement() { return document.createElement('ceiling-fan-card-editor'); }
  static getStubConfig() { return { entity: 'fan.my_ceiling_fan' }; }

  _isDark() {
    // Detect light/dark mode from HA theme
    const bg = getComputedStyle(document.documentElement)
      .getPropertyValue('--card-background-color').trim();
    if (!bg) return true;
    // Parse luminance — dark if background is dark
    const m = bg.match(/\d+/g);
    if (m && m.length >= 3) {
      const lum = 0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2];
      return lum < 128;
    }
    return true;
  }

  _build() {
    const r = this.shadowRoot;
    r.innerHTML = '';

    const style = document.createElement('style');
    style.textContent = CARD_STYLES;
    r.appendChild(style);

    const card = document.createElement('ha-card');

    const btnHtml = this._speedNames.map((lbl, i) => {
      const bars = BAR_H[i].map(h => '<div class="bar" style="height:' + h + 'px"></div>').join('');
      return '<button class="spd-btn" data-idx="' + i + '"><div class="btn-lbl">' + lbl + '</div><div class="bars">' + bars + '</div></button>';
    }).join('');

    card.innerHTML =
      '<div class="header">' +
        '<div class="title" id="name">מאוורר תקרה</div>' +
        '<div class="btns" id="btns">' +
          '<button class="icon-btn power-btn" id="power">' +
            '<svg viewBox="0 0 24 24"><path d="M12 2v6M6.3 6.3A8 8 0 1 0 17.7 6.3"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div class="fan-center">' +
        '<div class="fan-glow" id="glow"></div>' +
        '<svg class="fan-svg" viewBox="0 0 104 104">' +
          '<rect x="50" y="0" width="4" height="14" rx="2" fill="var(--fan-divider)"/>' +
          '<ellipse cx="52" cy="18" rx="10" ry="5" fill="var(--fan-bg2)" stroke="var(--fan-divider)" stroke-width="0.8"/>' +
          '<defs><ellipse id="blade-tmpl" cx="52" cy="30" rx="7" ry="22"/></defs>' +
          '<g id="blades">' +
            '<use href="#blade-tmpl" id="b1" fill="rgba(99,102,241,0.24)" stroke="rgba(99,102,241,0.32)" stroke-width="0.5"/>' +
            '<use href="#blade-tmpl" id="b2" transform="rotate(120 52 52)" fill="rgba(99,102,241,0.19)" stroke="rgba(99,102,241,0.26)" stroke-width="0.5"/>' +
            '<use href="#blade-tmpl" id="b3" transform="rotate(240 52 52)" fill="rgba(99,102,241,0.24)" stroke="rgba(99,102,241,0.32)" stroke-width="0.5"/>' +
          '</g>' +
          '<circle cx="52" cy="52" r="10" fill="var(--card-background-color, #fff)" stroke="rgba(99,102,241,0.3)" stroke-width="1"/>' +
          '<circle cx="52" cy="52" r="5" fill="var(--fan-accent)"/>' +
        '</svg>' +
        '<div class="speed-name off" id="spname">כבוי</div>' +
      '</div>' +
      '<div class="controls">' + btnHtml + '</div>' +
      '<div class="preset-section" id="preset-section" style="display:none">' +
        '<div class="preset-trigger" id="preset-trigger">' +
          '<div class="preset-trigger-left">' +
            '<svg class="preset-trigger-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 3"/></svg>' +
            '<span class="preset-selected" id="preset-selected"></span>' +
          '</div>' +
          '<svg class="preset-arrow" id="preset-arrow" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>' +
        '</div>' +
        '<div class="preset-list" id="preset-list"></div>' +
      '</div>' +
      '<div class="entities-section" id="entities-section" style="display:none"></div>';

    r.appendChild(card);

    r.getElementById('power').addEventListener('click', () => this._togglePower());
    r.querySelectorAll('.spd-btn').forEach(b =>
      b.addEventListener('click', () => this._setSpeed(parseInt(b.dataset.idx) + 1))
    );

    r.getElementById('preset-trigger')?.addEventListener('click', () => {
      const list = r.getElementById('preset-list');
      const arrow = r.getElementById('preset-arrow');
      list.classList.toggle('open');
      arrow.classList.toggle('open');
    });

    this._buildExtraBtn();
  }

  _buildExtraBtn() {
    const r = this.shadowRoot;
    const btns = r.getElementById('btns');
    if (!btns || !this._extra || r.getElementById('extra-btn')) return;

    const extraBtn = document.createElement('button');
    extraBtn.className = 'icon-btn extra-btn';
    extraBtn.id = 'extra-btn';

    if (this._extra.icon) {
      const haIcon = document.createElement('ha-icon');
      haIcon.setAttribute('icon', this._extra.icon);
      const color = this._extra.icon_color
        ? 'var(--' + this._extra.icon_color + '-color, ' + this._extra.icon_color + ')'
        : 'rgb(245,158,11)';
      haIcon.style.setProperty('--mdc-icon-size', '18px');
      haIcon.style.color = color;
      extraBtn.appendChild(haIcon);
    } else {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.style.cssText = 'width:15px;height:15px;fill:none;stroke:rgb(245,158,11);stroke-width:2;stroke-linecap:round;stroke-linejoin:round';
      svg.innerHTML = '<path d="M12 6a8 8 0 1 0 0 16 8 8 0 0 0 0-16z"/><path d="M12 10v4l2.5 2.5"/><path d="M9 2h6M12 2v4"/><path d="M18.4 5.6l1.4-1.4"/>';
      extraBtn.appendChild(svg);
    }

    extraBtn.addEventListener('click', () => this._handleExtraTap());
    btns.insertBefore(extraBtn, btns.firstChild);
  }

  _sync() {
    const obj = this._hass?.states[this._entity];
    if (!obj) return;

    const isOn = obj.state === 'on';
    let lvl = 0;

    if (isOn) {
      const presets = obj.attributes.preset_modes;
      const currentPreset = obj.attributes.preset_mode;

      if (presets && currentPreset && currentPreset !== 'כבוי' && currentPreset !== 'off') {
        // Find level by matching preset_mode to speed names
        const modes = presets.filter(p => p !== 'כבוי' && p !== 'off');
        const idx = modes.indexOf(currentPreset);
        if (idx >= 0) lvl = idx + 1;
      } else {
        // Fallback: use percentage
        const pct = obj.attributes.percentage || 0;
        if (pct > 0) {
          lvl = SPEED_PCT.reduce((best, p, i) =>
            Math.abs(p - pct) < Math.abs(SPEED_PCT[best - 1] - pct) ? i + 1 : best, 1);
        }
      }
    }

    const nameEl = this.shadowRoot.getElementById('name');
    if (nameEl) nameEl.textContent = this._name || obj.attributes.friendly_name || 'מאוורר תקרה';

    if (isOn && lvl > 0) this._startSpin(lvl);
    else if (!isOn && this._isOn) this._startDecelerate();
    this._isOn = isOn;

    this._updateUI(isOn, lvl);
    this._buildExtraBtn();
    this._syncPresets(obj);
    this._syncEntities();

    // Apply light mode adjustments if needed
  }

  _applyTheme() {
    const card = this.shadowRoot.querySelector('ha-card');
    if (!card) return;
    const dark = this._isDark();
    // In light mode make divider and bg2 more visible
    if (!dark) {
      card.style.setProperty('--fan-divider', 'rgba(0,0,0,0.15)');
      card.style.setProperty('--fan-bg2', 'rgba(0,0,0,0.05)');
      card.style.setProperty('--fan-disabled', '#9e9e9e');
    } else {
      card.style.removeProperty('--fan-divider');
      card.style.removeProperty('--fan-bg2');
      card.style.removeProperty('--fan-disabled');
    }
  }

  _syncPresets(obj) {
    const r = this.shadowRoot;
    const section = r.getElementById('preset-section');
    const list    = r.getElementById('preset-list');
    const selected = r.getElementById('preset-selected');
    if (!section || !list || !selected) return;

    // Get preset_modes — exclude speed-related presets (כבוי + the 6 speed names)
    const allPresets  = obj.attributes.preset_modes || [];
    const speedNames  = new Set([...this._speedNames, 'כבוי', 'off']);
    const presets     = allPresets.filter(p => !speedNames.has(p));

    if (presets.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = 'block';
    const currentPreset = obj.attributes.preset_mode || '';

    // Rebuild list only if presets changed
    const existing = [...list.querySelectorAll('.preset-item')].map(el => el.dataset.preset);
    if (JSON.stringify(existing) !== JSON.stringify(presets)) {
      list.innerHTML = '';
      presets.forEach(preset => {
        const item = document.createElement('div');
        item.className = 'preset-item' + (preset === currentPreset ? ' active' : '');
        item.dataset.preset = preset;
        item.innerHTML =
          '<span class="preset-item-name">' + preset + '</span>' +
          '<svg class="preset-check" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>';
        item.addEventListener('click', () => {
          this._hass.callService('fan', 'turn_on', {
            entity_id: this._entity,
            preset_mode: preset,
          });
          list.classList.remove('open');
          r.getElementById('preset-arrow')?.classList.remove('open');
        });
        list.appendChild(item);
      });
    } else {
      // Just update active state
      list.querySelectorAll('.preset-item').forEach(el => {
        el.classList.toggle('active', el.dataset.preset === currentPreset);
      });
    }

    // Update selected label
    const activePreset = presets.includes(currentPreset) ? currentPreset : presets[0];
    selected.textContent = activePreset;
  }

  _syncEntities() {
    const r = this.shadowRoot;
    const section = r.getElementById('entities-section');
    if (!section) return;

    const entities = this._config.entities;
    if (!entities || entities.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = 'block';

    entities.forEach((cfg, i) => {
      const id = 'entity-row-' + i;
      let row = r.getElementById(id);
      const obj = this._hass?.states[cfg.entity];
      const isOn = obj?.state === 'on' || obj?.state === 'true';
      const domain = cfg.entity.split('.')[0];
      const isToggleable = ['switch','light','input_boolean','fan','automation'].includes(domain);
      const name = cfg.name || obj?.attributes?.friendly_name || cfg.entity;
      const icon = cfg.icon || obj?.attributes?.icon || this._defaultIcon(domain);
      const stateLabel = isOn ? 'פועל' : (obj ? 'כבוי' : 'לא זמין');

      if (!row) {
        // Build row
        row = document.createElement('div');
        row.className = 'entity-row';
        row.id = id;

        const iconWrap = document.createElement('div');
        iconWrap.className = 'entity-icon-wrap' + (isOn ? ' on' : '');
        iconWrap.id = id + '-icon';
        const haIcon = document.createElement('ha-icon');
        haIcon.setAttribute('icon', icon);
        iconWrap.appendChild(haIcon);

        const info = document.createElement('div');
        info.className = 'entity-info';
        info.innerHTML = '<div class="entity-name">' + name + '</div><div class="entity-state' + (isOn?' on':'') + '" id="' + id + '-state">' + stateLabel + '</div>';

        row.appendChild(iconWrap);
        row.appendChild(info);

        if (isToggleable) {
          const toggle = document.createElement('button');
          toggle.className = 'entity-toggle' + (isOn ? ' on' : '');
          toggle.id = id + '-toggle';
          toggle.innerHTML = '<div class="entity-toggle-thumb"></div>';
          toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this._tapEntity(cfg);
          });
          row.appendChild(toggle);
        } else {
          const chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          chevron.setAttribute('viewBox', '0 0 24 24');
          chevron.setAttribute('class', 'entity-chevron');
          chevron.innerHTML = '<polyline points="9 18 15 12 9 6"/>';
          row.appendChild(chevron);
        }

        row.addEventListener('click', () => this._tapEntity(cfg));
        section.appendChild(row);
      } else {
        // Update existing row
        const iconWrap = r.getElementById(id + '-icon');
        if (iconWrap) iconWrap.className = 'entity-icon-wrap' + (isOn ? ' on' : '');
        const stateEl = r.getElementById(id + '-state');
        if (stateEl) { stateEl.textContent = stateLabel; stateEl.className = 'entity-state' + (isOn ? ' on' : ''); }
        const toggleEl = r.getElementById(id + '-toggle');
        if (toggleEl) { toggleEl.className = 'entity-toggle' + (isOn ? ' on' : ''); }
      }
    });
  }

  _defaultIcon(domain) {
    const icons = {
      switch: 'mdi:toggle-switch', light: 'mdi:lightbulb',
      input_boolean: 'mdi:checkbox-marked-circle', fan: 'mdi:fan',
      automation: 'mdi:robot', script: 'mdi:script-text',
      scene: 'mdi:palette', timer: 'mdi:timer',
    };
    return icons[domain] || 'mdi:power';
  }

  _tapEntity(cfg) {
    if (!this._hass) return;
    const domain = cfg.entity.split('.')[0];
    const tapAction = cfg.tap_action || defaultTapAction(domain);
    this.dispatchEvent(new CustomEvent('hass-action', {
      bubbles: true, composed: true,
      detail: { config: { entity: cfg.entity, tap_action: tapAction }, action: 'tap' },
    }));
  }



  _updateUI(isOn, lvl) {
    const r = this.shadowRoot;
    r.getElementById('power')?.classList.toggle('on', isOn);
    r.getElementById('glow')?.classList.toggle('active', isOn && lvl > 0);

    const spname = r.getElementById('spname');
    if (spname && isOn && lvl > 0) {
      spname.textContent = this._speedNames[lvl - 1];
      spname.classList.remove('off');
    }

    r.querySelectorAll('.spd-btn').forEach(b =>
      b.classList.toggle('active', isOn && parseInt(b.dataset.idx) === lvl - 1)
    );

    if (isOn && lvl > 0) this._setBladeColors(lvl - 1);
  }

  _getAccentColor() {
    return getComputedStyle(this.shadowRoot.querySelector('ha-card') || document.documentElement)
      .getPropertyValue('--accent-color').trim() || '#6366f1';
  }

  _setBladeColors(idx) {
    const [o1, o2] = BLADE_OPS[idx];
    const r = this.shadowRoot;
    const accent = this._getAccentColor();
    const f1 = 'color-mix(in srgb, ' + accent + ' ' + Math.round(o1 * 100) + '%, transparent)';
    const f2 = 'color-mix(in srgb, ' + accent + ' ' + Math.round(o2 * 100) + '%, transparent)';
    [['b1',f1],['b2',f2],['b3',f1]].forEach(([id,f]) => {
      const el = r.getElementById(id);
      if (el) { el.setAttribute('fill', f); el.setAttribute('stroke', f); }
    });
  }

  _startSpin(lvl) {
    this._decelerating = false;
    this._currentDur = TARGET_DURS[lvl - 1];
    if (!this._rafId) { this._lastTs = null; this._rafId = requestAnimationFrame(ts => this._loop(ts)); }
  }

  _startDecelerate() {
    this._decelerating = true;
    if (!this._rafId) { this._lastTs = null; this._rafId = requestAnimationFrame(ts => this._loop(ts)); }
  }

  _loop(ts) {
    if (!this._lastTs) this._lastTs = ts;
    const dt = Math.min((ts - this._lastTs) / 1000, 0.05);
    this._lastTs = ts;

    if (this._decelerating) {
      this._currentDur += dt * 5.0;
      if (this._currentDur >= 20) {
        this._decelerating = false;
        this._rafId = null;
        const spname = this.shadowRoot.getElementById('spname');
        if (spname) { spname.textContent = 'כבוי'; spname.classList.add('off'); }
        return;
      }
    }

    this._angle = (this._angle + 360 / this._currentDur * dt) % 360;
    this.shadowRoot.getElementById('blades')?.setAttribute('transform', 'rotate(' + this._angle + ' 52 52)');
    this._rafId = requestAnimationFrame(ts => this._loop(ts));
  }

  _togglePower() {
    const isOn = this._hass?.states[this._entity]?.state === 'on';
    this._hass.callService('fan', isOn ? 'turn_off' : 'turn_on', { entity_id: this._entity });
  }

  _setSpeed(n) {
    const obj = this._hass?.states[this._entity];
    const presets = obj?.attributes?.preset_modes;

    if (presets && presets.length > 0) {
      // Use preset_mode — skip "כבוי" as first preset if exists
      const modes = presets.filter(p => p !== 'כבוי' && p !== 'off');
      const mode = modes[n - 1];
      if (mode) {
        this._hass.callService('fan', 'turn_on', {
          entity_id: this._entity,
          preset_mode: mode,
        });
        return;
      }
    }
    // Fallback to percentage
    this._hass.callService('fan', 'turn_on', { entity_id: this._entity, percentage: SPEED_PCT[n - 1] });
  }

  _handleExtraTap() {
    if (!this._extra || !this._hass) return;
    this.dispatchEvent(new CustomEvent('hass-action', {
      bubbles: true, composed: true,
      detail: {
        config: { entity: this._extra.entity, tap_action: this._extra.tap_action },
        action: 'tap',
      },
    }));
  }
}

/* ══ Editor ══ */
const EDITOR_STYLES = `
  :host { display: block; }
  .root { padding: 4px 0; }
  ha-form { display: block; }
  .section-title {
    font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;
    color: var(--secondary-text-color); margin: 20px 0 8px;
    padding-bottom: 4px; border-bottom: 1px solid var(--divider-color);
  }
  .extra-block { border: 1px solid var(--divider-color); border-radius: 8px; padding: 12px; margin-top: 8px; }
  ha-entity-picker, ha-icon-picker { display: block; margin-bottom: 12px; }
  ha-formfield { display: block; }
`;

class CeilingFanCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
  }

  setConfig(config) { this._config = { ...config }; this._render(); }

  set hass(hass) {
    this._hass = hass;
    // Re-render if not yet rendered (hass arrives before/after setConfig)
    if (!this.shadowRoot.querySelector('.root')) {
      this._render();
    }
    this.shadowRoot.querySelectorAll('ha-form, ha-entity-picker, ha-icon-picker, hui-action-editor')
      .forEach(el => { el.hass = hass; });
  }

  _fire() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this._config }, bubbles: true, composed: true,
    }));
  }

  _render() {
    const r = this.shadowRoot;
    r.innerHTML = '';
    const style = document.createElement('style');
    style.textContent = EDITOR_STYLES;
    r.appendChild(style);

    const root = document.createElement('div');
    root.className = 'root';

    // Main form
    const mainForm = document.createElement('ha-form');
    mainForm.hass = this._hass;
    mainForm.schema = [
      { name: 'entity', required: true, selector: { entity: { domain: 'fan' } } },
      { name: 'name', selector: { text: {} } },
    ];
    mainForm.data = { entity: this._config.entity || '', name: this._config.name || '' };
    mainForm.computeLabel = s => ({ entity: 'ישות מאוורר', name: 'שם מותאם' })[s.name] || s.name;
    mainForm.addEventListener('value-changed', e => {
      this._config = { ...this._config, ...e.detail.value };
      this._fire();
    });
    root.appendChild(mainForm);

    // Speed names
    const speedTitle = document.createElement('div');
    speedTitle.className = 'section-title';
    speedTitle.textContent = 'שמות מהירויות';
    root.appendChild(speedTitle);

    const names = Array.isArray(this._config.speed_names) ? this._config.speed_names : DEFAULT_SPEED_NAMES;
    const speedForm = document.createElement('ha-form');
    speedForm.hass = this._hass;
    speedForm.schema = names.map((_, i) => ({ name: 'speed_' + (i+1), selector: { text: {} } }));
    speedForm.data = Object.fromEntries(names.map((n, i) => ['speed_' + (i+1), n]));
    speedForm.computeLabel = s => 'מהירות ' + s.name.replace('speed_', '');
    speedForm.addEventListener('value-changed', e => {
      const updated = names.map((_, i) => e.detail.value['speed_' + (i+1)] || DEFAULT_SPEED_NAMES[i]);
      this._config = { ...this._config, speed_names: updated };
      this._fire();
    });
    root.appendChild(speedForm);

    // Extra entity
    const extraTitle = document.createElement('div');
    extraTitle.className = 'section-title';
    extraTitle.textContent = 'ישות נוספת';
    root.appendChild(extraTitle);

    const extra = this._config.extra_entity || null;
    const extraToggle = document.createElement('ha-formfield');
    extraToggle.style.cssText = 'display:flex;align-items:center;flex-direction:row-reverse;justify-content:flex-end;gap:8px;margin-bottom:8px';
    extraToggle.innerHTML = '<ha-switch id="extra-sw"' + (extra ? ' checked' : '') + '></ha-switch><span style="margin-right:8px;font-size:14px;color:var(--primary-text-color)">הוסף ישות לכרטיס</span>';
    extraToggle.querySelector('ha-switch').addEventListener('change', e => {
      if (e.target.checked) {
        this._config = { ...this._config, extra_entity: { entity: '' } };
      } else {
        const { extra_entity, ...rest } = this._config;
        this._config = rest;
      }
      this._fire();
      this._render();
    });
    root.appendChild(extraToggle);

    if (extra) {
      const extraBlock = document.createElement('div');
      extraBlock.className = 'extra-block';

      const extraForm = document.createElement('ha-form');
      extraForm.hass = this._hass;
      extraForm.schema = [
        { name: 'entity', required: true, selector: { entity: {} } },
        { name: 'name', selector: { text: {} } },
        { name: 'icon', selector: { icon: {} } },
        { name: 'icon_color', selector: { ui_color: {} } },
      ];
      extraForm.data = {
        entity: extra.entity || '',
        name: extra.name || '',
        icon: extra.icon || '',
        icon_color: extra.icon_color || '',
      };
      extraForm.computeLabel = s => ({ entity: 'ישות', name: 'שם תווית', icon: 'אייקון', icon_color: 'צבע אייקון' })[s.name] || s.name;
      extraForm.addEventListener('value-changed', e => {
        this._config = { ...this._config, extra_entity: { ...this._config.extra_entity, ...e.detail.value } };
        this._fire();
      });
      extraBlock.appendChild(extraForm);

      const actionTitle = document.createElement('div');
      actionTitle.className = 'section-title';
      actionTitle.textContent = 'אינטראקציה';
      actionTitle.style.marginTop = '12px';
      extraBlock.appendChild(actionTitle);

      const actionEditor = document.createElement('hui-action-editor');
      actionEditor.hass = this._hass;
      actionEditor.label = 'התנהגות בהקשה';
      actionEditor.config = extra.tap_action || { action: 'more-info' };
      actionEditor.actions = ['more-info', 'toggle', 'navigate', 'url', 'perform-action', 'assist', 'none'];
      actionEditor.addEventListener('value-changed', e => {
        this._config = { ...this._config, extra_entity: { ...this._config.extra_entity, tap_action: e.detail.value } };
        this._fire();
      });
      extraBlock.appendChild(actionEditor);

      root.appendChild(extraBlock);
    }

    // Entities section via ha-form with entity_list selector
    const entitiesTitle = document.createElement('div');
    entitiesTitle.className = 'section-title';
    entitiesTitle.textContent = 'ישויות נוספות';
    root.appendChild(entitiesTitle);

    const entities = this._config.entities || [];

    // Build each entity row
    const entitiesContainer = document.createElement('div');
    entities.forEach((cfg, i) => {
      entitiesContainer.appendChild(this._buildEntityRow(cfg, i));
    });
    root.appendChild(entitiesContainer);

    // Add entity button — opens ha-entity-picker inline
    const addWrap = document.createElement('div');
    addWrap.style.cssText = 'margin-top:8px';
    const newPicker = document.createElement('ha-entity-picker');
    newPicker.label = '+ הוסף ישות';
    newPicker.value = '';
    newPicker.allowCustomEntity = false;
    if (this._hass) newPicker.hass = this._hass;
    newPicker.addEventListener('value-changed', e => {
      if (!e.detail.value) return;
      const updated = [...(this._config.entities || []), { entity: e.detail.value }];
      this._config = { ...this._config, entities: updated };
      this._fire();
      this._render();
    });
    addWrap.appendChild(newPicker);
    root.appendChild(addWrap);

    r.appendChild(root);

    // Forward hass AFTER DOM is ready — critical for hui-action-editor
    if (this._hass) {
      r.querySelectorAll('ha-form, hui-action-editor, ha-entity-picker, ha-icon-picker').forEach(el => {
        el.hass = this._hass;
      });
    }
  }

  _buildEntityRow(cfg, i) {
    const row = document.createElement('div');
    row.style.cssText = 'border:1px solid var(--divider-color);border-radius:8px;padding:10px;margin-bottom:8px;position:relative';

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.style.cssText = 'position:absolute;top:6px;left:6px;background:none;border:none;cursor:pointer;padding:2px;color:var(--secondary-text-color);display:flex;align-items:center';
    const delIcon = document.createElement('ha-icon');
    delIcon.setAttribute('icon', 'mdi:close');
    delIcon.style.setProperty('--mdc-icon-size', '18px');
    delBtn.appendChild(delIcon);
    delBtn.addEventListener('click', () => {
      const updated = [...(this._config.entities || [])];
      updated.splice(i, 1);
      this._config = { ...this._config, entities: updated };
      this._fire();
      this._render();
    });
    row.appendChild(delBtn);

    // Entity form
    const form = document.createElement('ha-form');
    form.hass = this._hass;
    form.schema = [
      { name: 'entity',    required: true, selector: { entity: {} } },
      { name: 'name',      selector: { text: {} } },
      { name: 'icon',      selector: { icon: {} } },
    ];
    form.data = {
      entity: cfg.entity || '',
      name:   cfg.name   || '',
      icon:   cfg.icon   || '',
    };
    form.computeLabel = s => ({ entity: 'ישות', name: 'שם תווית', icon: 'אייקון' })[s.name] || s.name;
    form.addEventListener('value-changed', e => {
      const updated = [...(this._config.entities || [])];
      updated[i] = { ...updated[i], ...e.detail.value };
      this._config = { ...this._config, entities: updated };
      this._fire();
    });
    row.appendChild(form);

    // tap_action via ha-form with action selector
    const actionForm = document.createElement('ha-form');
    actionForm.hass   = this._hass;
    actionForm.schema = [{ name: 'tap_action', selector: { action: {} } }];
    const domain = cfg.entity ? cfg.entity.split('.')[0] : '';
    actionForm.data   = { tap_action: cfg.tap_action || defaultTapAction(domain) };
    actionForm.computeLabel = () => 'התנהגות בהקשה';
    actionForm.addEventListener('value-changed', e => {
      console.log('action value-changed:', JSON.stringify(e.detail.value));
      const val = e.detail.value;
      // ha-form returns { tap_action: {...} } OR just the action object directly
      const tapAction = val?.tap_action !== undefined ? val.tap_action : val;
      const updated = [...(this._config.entities || [])];
      updated[i] = { ...updated[i], tap_action: tapAction };
      this._config = { ...this._config, entities: updated };
      this._fire();
    });
    row.appendChild(actionForm);

    return row;
  }
}

customElements.define('ceiling-fan-card', CeilingFanCard);
customElements.define('ceiling-fan-card-editor', CeilingFanCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'ceiling-fan-card',
  name: 'Ceiling Fan Card',
  description: 'כרטיס מאוורר תקרה — 3 להבים, עצירה הדרגתית, ישות נוספת',
  preview: true,
});
