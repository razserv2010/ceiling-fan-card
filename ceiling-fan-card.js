/**
 * ceiling-fan-card — Home Assistant Lovelace Custom Card
 *
 * type: custom:ceiling-fan-card
 * entity: fan.my_ceiling_fan
 * name: מאוורר סלון
 * direction_entity: select.fan_direction  <-- תמיכה בישות נפרדת
 * speed_names: [חלש מאוד, חלש, בינוני-חלש, בינוני, חזק, חזק מאוד]
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

  /* ── כפתור כיוון ── */
  .dir-btn svg {
    width: 15px; height: 15px;
    stroke: var(--fan-subtext);
    fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
    transition: transform .4s ease, stroke .3s;
  }
  .dir-btn:hover { border-color: var(--fan-accent); }
  .dir-btn:hover svg { stroke: var(--fan-text); }
  .dir-btn.reverse svg { transform: scaleX(-1); }

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

  /* select chips */
  .select-chips { display: flex; gap: 4px; flex-wrap: wrap; padding: 4px 0 2px 0; }
  .select-chip {
    padding: 3px 12px; border-radius: 20px; font-size: 11px; font-weight: 600;
    border: 1px solid var(--fan-divider); background: var(--fan-bg2);
    color: var(--fan-subtext); cursor: pointer; transition: all .2s;
  }
  .select-chip:hover { border-color: var(--fan-accent); color: var(--fan-text); }
  .select-chip.active { border-color: var(--fan-accent); background: color-mix(in srgb, var(--fan-accent) 15%, transparent); color: var(--fan-accent); }
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
    this._isReverse = false;
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
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--card-background-color').trim();
    if (!bg) return true;
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
          '<button class="icon-btn dir-btn" id="direction" style="display:none" title="החלף כיוון">' +
            '<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>' +
          '</button>' +
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
    r.getElementById('direction').addEventListener('click', () => this._toggleDirection());
    
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

    // זיהוי ישות כיוון (נפרדת או מובנית)
    const dirBtn = this.shadowRoot.getElementById('direction');
    let hasDirection = false;

    // 1. בדיקה אם הוגדרה ישות כיוון נפרדת
    if (this._config.direction_entity && this._hass.states[this._config.direction_entity]) {
      hasDirection = true;
      const dirObj = this._hass.states[this._config.direction_entity];
      const dirStateStr = String(dirObj.state).toLowerCase().trim();
      // תמיכה ב-reverse, חורף, on
      this._isReverse = (dirStateStr === 'reverse' || dirStateStr === 'חורף' || dirStateStr === 'on');
    } 
    // 2. גיבוי - מאפיין כיוון מובנה במאוורר
    else if (obj.attributes && obj.attributes.direction) {
      hasDirection = true;
      this._isReverse = (obj.attributes.direction === 'reverse');
    }

    // הצגה או הסתרה של הכפתור
    if (hasDirection) {
      dirBtn.style.display = 'flex';
      dirBtn.classList.toggle('reverse', this._isReverse);
    } else {
      dirBtn.style.display = 'none';
    }

    if (isOn) {
      const presets = obj.attributes.preset_modes;
      const currentPreset = obj.attributes.preset_mode;

      if (presets && currentPreset && currentPreset !== 'כבוי' && currentPreset !== 'off') {
        const modes = presets.filter(p => p !== 'כבוי' && p !== 'off');
        const idx = modes.indexOf(currentPreset);
        if (idx >= 0) lvl = idx + 1;
      } else {
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
  }

  _applyTheme() {
    const card = this.shadowRoot.querySelector('ha-card');
    if (!card) return;
    const dark = this._isDark();
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

    const allPresets  = obj.attributes.preset_modes || [];
    const speedNames  = new Set([...this._speedNames, 'כבוי', 'off']);
    const presets     = allPresets.filter(p => !speedNames.has(p));

    if (presets.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = 'block';
    const currentPreset = obj.attributes.preset_mode || '';

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
      list.querySelectorAll('.preset-item').forEach(el => {
        el.classList.toggle('active', el.dataset.preset === currentPreset);
      });
    }

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
      const isSelect = ['select','input_select'].includes(domain);
      const name = cfg.name || obj?.attributes?.friendly_name || cfg.entity;
      const icon = cfg.icon || obj?.attributes?.icon || this._defaultIcon(domain);
      const stateLabel = isOn ? 'פועל' : (obj ? 'כבוי' : 'לא זמין');

      if (!row) {
        row = document.createElement('div');
        row.className = 'entity-row';
        row.id = id;

        const iconWrap = document.createElement('div');
        iconWrap.className = 'entity-icon-wrap' + (isOn ? ' on' : '');
        iconWrap.id = id + '-icon';
        const haIcon = document.createElement('ha-icon');
        haIcon.setAttribute('icon', icon);
        iconWrap.appendChild(haIcon);
        row.appendChild(iconWrap);

        if (isSelect) {
          row.style.flexWrap = 'wrap';
          const nameEl = document.createElement('div');
          nameEl.className = 'entity-name';
          nameEl.style.flex = '1';
          nameEl.textContent = name;
          row.appendChild(nameEl);

          const chips = document.createElement('div');
          chips.className = 'select-chips';
          chips.id = id + '-chips';
          const options = obj?.attributes?.options || [];
          options.forEach(opt => {
            const chip = document.createElement('div');
            chip.className = 'select-chip' + (opt === obj?.state ? ' active' : '');
            chip.dataset.opt = opt;
            chip.textContent = opt;
            chip.addEventListener('click', e => {
              e.stopPropagation();
              this._hass.callService(domain, 'select_option', {
                entity_id: cfg.entity, option: opt,
              });
            });
            chips.appendChild(chip);
          });
          row.appendChild(chips);
        } else {
          const info = document.createElement('div');
          info.className = 'entity-info';
          info.innerHTML = '<div class="entity-name">' + name + '</div><div class="entity-state' + (isOn?' on':'') + '" id="' + id + '-state">' + stateLabel + '</div>';
          row.appendChild(info);

          if (isToggleable) {
            const toggle = document.createElement('button');
            toggle.className = 'entity-toggle' + (isOn ? ' on' : '');
            toggle.id = id + '-toggle';
            toggle.innerHTML = '<div class="entity-toggle-thumb"></div>';
            toggle.addEventListener('click', e => { e.stopPropagation(); this._tapEntity(cfg); });
            row.appendChild(toggle);
          } else {
            const chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            chevron.setAttribute('viewBox', '0 0 24 24');
            chevron.setAttribute('class', 'entity-chevron');
            chevron.innerHTML = '<polyline points="9 18 15 12 9 6"/>';
            row.appendChild(chevron);
          }
          row.addEventListener('click', () => this._tapEntity(cfg));
        }

        section.appendChild(row);
      } else {
        if (isSelect) {
          const chipsEl = r.getElementById(id + '-chips');
          if (chipsEl) chipsEl.querySelectorAll('.select-chip').forEach(c => {
            c.classList.toggle('active', c.dataset.opt === obj?.state);
          });
        } else {
          const iconWrap = r.getElementById(id + '-icon');
          if (iconWrap) iconWrap.className = 'entity-icon-wrap' + (isOn ? ' on' : '');
          const stateEl = r.getElementById(id + '-state');
          if (stateEl) { stateEl.textContent = stateLabel; stateEl.className = 'entity-state' + (isOn ? ' on' : ''); }
          const toggleEl = r.getElementById(id + '-toggle');
          if (toggleEl) toggleEl.className = 'entity-toggle' + (isOn ? ' on' : '');
        }
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
    const action = tapAction?.action || 'more-info';

    if (action === 'more-info') {
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true, composed: true,
        detail: { entityId: cfg.entity },
      }));
    } else if (action === 'toggle') {
      this._hass.callService(domain, 'toggle', { entity_id: cfg.entity });
    } else if (action === 'perform-action' || action === 'call-service') {
      const svc = tapAction.perform_action || tapAction.service;
      if (svc) {
        const [sd, sn] = svc.split('.');
        this._hass.callService(sd, sn, {
          ...(tapAction.data || tapAction.service_data || {}),
          ...(tapAction.target || {}),
        });
      }
    } else if (action === 'navigate') {
      history.pushState(null, '', tapAction.navigation_path);
      window.dispatchEvent(new CustomEvent('location-changed', { bubbles: true, composed: true }));
    } else {
      this.dispatchEvent(new CustomEvent('hass-action', {
        bubbles: true, composed: true,
        detail: { config: { entity: cfg.entity, tap_action: tapAction }, action: 'tap' },
      }));
    }
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

    const dirMult = this._isReverse ? -1 : 1;
    this._angle = (this._angle + (360 / this._currentDur * dt * dirMult)) % 360;
    
    this.shadowRoot.getElementById('blades')?.setAttribute('transform', 'rotate(' + this._angle + ' 52 52)');
    this._rafId = requestAnimationFrame(ts => this._loop(ts));
  }

  _togglePower() {
    const isOn = this._hass?.states[this._entity]?.state === 'on';
    this._hass.callService('fan', isOn ? 'turn_off' : 'turn_on', { entity_id: this._entity });
  }

  _toggleDirection() {
    // 1. טיפול בישות כיוון נפרדת (אם הוגדרה)
    if (this._config.direction_entity && this._hass?.states[this._config.direction_entity]) {
      const dirObj = this._hass.states[this._config.direction_entity];
      const domain = this._config.direction_entity.split('.')[0];

      if (['select', 'input_select'].includes(domain)) {
        // משיג את האפשרויות הזמינות ישירות מהישות (למשל: ['קיץ', 'חורף'])
        const options = dirObj.attributes.options || [];
        if (options.length > 0) {
          const currentIndex = options.indexOf(dirObj.state);
          // מעביר לאפשרות הבאה במערך
          const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % options.length : 0;
          const nextOption = options[nextIndex];
          
          this._hass.callService(domain, 'select_option', {
            entity_id: this._config.direction_entity,
            option: nextOption
          });

          // עדכון מיידי של התצוגה והאנימציה לפי האפשרות שנבחרה
          this._isReverse = (String(nextOption).toLowerCase() === 'reverse' || nextOption === 'חורף');
          this.shadowRoot.getElementById('direction')?.classList.toggle('reverse', this._isReverse);
        }

      } else if (['switch', 'input_boolean'].includes(domain)) {
        this._hass.callService(domain, 'toggle', { entity_id: this._config.direction_entity });
      }

    } 
    // 2. טיפול במאפיין הכיוון המובנה של המאוורר (גיבוי מקורי)
    else {
      const obj = this._hass?.states[this._entity];
      if (!obj || !obj.attributes.direction) return;
      const newDir = obj.attributes.direction === 'forward' ? 'reverse' : 'forward';
      
      this._hass.callService('fan', 'set_direction', {
        entity_id: this._entity,
        direction: newDir
      });

      this._isReverse = (newDir === 'reverse');
      this.shadowRoot.getElementById('direction')?.classList.toggle('reverse', this._isReverse);
    }
  }

  _setSpeed(n) {
    const obj = this._hass?.states[this._entity];
    const presets = obj?.attributes?.preset_modes;

    if (presets && presets.length > 0) {
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
  :host { display: block; font-family: var(--paper-font-common-base_-_font-family); }
  .root { padding: 16px 0; }
  ha-form { display: block; margin-bottom: 24px; }
  
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    margin-top: 24px;
  }
  .section-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 400;
    color: var(--primary-text-color);
  }
  
  .list-item {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--secondary-background-color);
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 12px;
    border: 1px solid var(--divider-color);
    position: relative;
  }
  .list-item-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  ha-icon {
    cursor: pointer;
    color: var(--secondary-text-color);
    transition: color 0.2s;
  }
  ha-icon:hover {
    color: var(--primary-text-color);
  }
  
  .add-entity-row {
    margin-top: 16px;
  }
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
    if (!this.shadowRoot.querySelector('.root')) { this._render(); }
    this.shadowRoot.querySelectorAll('ha-form, ha-entity-picker').forEach(el => {
      if (el.hass !== undefined) el.hass = hass;
    });
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
    root.setAttribute('dir', 'rtl');

    // 1. הגדרות ראשיות
    const mainForm = document.createElement('ha-form');
    mainForm.hass = this._hass;
    mainForm.schema = [
      { name: 'entity', selector: { entity: { domain: 'fan' } } },
      { name: 'name', selector: { text: {} } },
      { name: 'direction_entity', selector: { entity: {} } }, // שדה לישות כיוון נפרדת
    ];
    mainForm.data = { 
      entity: this._config.entity || '', 
      name: this._config.name || '',
      direction_entity: this._config.direction_entity || '' 
    };
    mainForm.computeLabel = s => ({ 
      entity: 'ישות מאוורר ראשי (חובה)', 
      name: 'שם לתצוגה בכרטיס',
      direction_entity: 'ישות כיוון נפרדת (אופציונלי - Select/Switch)'
    })[s.name] || s.name;
    mainForm.addEventListener('value-changed', e => {
      this._config = { ...this._config, ...e.detail.value }; this._fire();
    });
    root.appendChild(mainForm);

    // 2. שמות מהירויות
    const speedHeader = document.createElement('div');
    speedHeader.className = 'section-header';
    speedHeader.innerHTML = '<h3>שמות מהירויות (לפי סדר עולה)</h3>';
    root.appendChild(speedHeader);

    const names = Array.isArray(this._config.speed_names) ? this._config.speed_names : DEFAULT_SPEED_NAMES;
    const speedForm = document.createElement('ha-form');
    speedForm.hass = this._hass;
    speedForm.schema = [{
      type: "grid", name: "",
      schema: names.map((_, i) => ({ name: 'speed_' + (i+1), selector: { text: {} } }))
    }];
    speedForm.data = Object.fromEntries(names.map((n, i) => ['speed_' + (i+1), n]));
    speedForm.computeLabel = s => 'מהירות ' + s.name.replace('speed_', '');
    speedForm.addEventListener('value-changed', e => {
      const updated = names.map((_, i) => e.detail.value['speed_' + (i+1)] || DEFAULT_SPEED_NAMES[i]);
      this._config = { ...this._config, speed_names: updated }; this._fire();
    });
    root.appendChild(speedForm);

    // 3. כפתור אקסטרה
    const extraHeader = document.createElement('div');
    extraHeader.className = 'section-header';
    extraHeader.innerHTML = '<h3>כפתור פעולה נוסף (מופיע ליד כפתור ההדלקה)</h3>';
    
    const extraToggleWrapper = document.createElement('div');
    const extraToggle = document.createElement('ha-formfield');
    extraToggle.label = 'הצג כפתור נוסף';
    const extra = this._config.extra_entity || null;
    extraToggle.innerHTML = `<ha-switch ${extra ? 'checked' : ''}></ha-switch>`;
    extraToggle.querySelector('ha-switch').addEventListener('change', e => {
      if (e.target.checked) {
        this._config = { ...this._config, extra_entity: { entity: '' } };
      } else {
        const { extra_entity, ...rest } = this._config;
        this._config = rest;
      }
      this._fire(); this._render();
    });
    extraToggleWrapper.appendChild(extraToggle);
    extraHeader.appendChild(extraToggleWrapper);
    root.appendChild(extraHeader);

    if (extra) {
      const extraForm = document.createElement('ha-form');
      extraForm.hass = this._hass;
      extraForm.schema = [
        { name: 'entity', selector: { entity: {} } },
        { name: 'name', selector: { text: {} } },
        { type: "grid", name: "", schema: [
          { name: 'icon', selector: { icon: {} } },
          { name: 'icon_color', selector: { ui_color: {} } }
        ]}
      ];
      extraForm.data = {
        entity: extra.entity || '', name: extra.name || '',
        icon: extra.icon || '', icon_color: extra.icon_color || '',
      };
      extraForm.computeLabel = s => ({ entity: 'ישות', name: 'שם (אופציונלי)', icon: 'אייקון', icon_color: 'צבע אייקון' })[s.name] || s.name;
      extraForm.addEventListener('value-changed', e => {
        this._config = { ...this._config, extra_entity: { ...this._config.extra_entity, ...e.detail.value } };
        this._fire();
      });
      root.appendChild(extraForm);
    }

    // 4. ישויות נוספות
    const entitiesHeader = document.createElement('div');
    entitiesHeader.className = 'section-header';
    entitiesHeader.innerHTML = '<h3>ישויות נוספות (שורות בתחתית)</h3>';
    root.appendChild(entitiesHeader);

    const entities = this._config.entities || [];
    const entitiesContainer = document.createElement('div');
    entities.forEach((cfg, i) => {
      entitiesContainer.appendChild(this._buildEntityRow(cfg, i));
    });
    root.appendChild(entitiesContainer);

    const addWrap = document.createElement('div');
    addWrap.className = 'add-entity-row';
    const newPicker = document.createElement('ha-entity-picker');
    newPicker.label = 'בחר ישות להוספה...';
    newPicker.value = '';
    newPicker.allowCustomEntity = false;
    if (this._hass) newPicker.hass = this._hass;
    newPicker.addEventListener('value-changed', e => {
      if (!e.detail.value) return;
      const updated = [...(this._config.entities || []), { entity: e.detail.value }];
      this._config = { ...this._config, entities: updated };
      this._fire(); this._render();
    });
    addWrap.appendChild(newPicker);
    root.appendChild(addWrap);

    r.appendChild(root);
  }

  _buildEntityRow(cfg, i) {
    const row = document.createElement('div');
    row.className = 'list-item';

    const content = document.createElement('div');
    content.className = 'list-item-content';

    const form = document.createElement('ha-form');
    form.hass = this._hass;
    form.schema = [
      { name: 'entity', selector: { entity: {} } },
      { type: "grid", name: "", schema: [
        { name: 'name', selector: { text: {} } },
        { name: 'icon', selector: { icon: {} } }
      ]}
    ];
    form.data = { entity: cfg.entity || '', name: cfg.name || '', icon: cfg.icon || '' };
    form.computeLabel = s => ({ entity: 'ישות', name: 'שם דורס', icon: 'אייקון' })[s.name] || s.name;
    form.addEventListener('value-changed', e => {
      const updated = [...(this._config.entities || [])];
      updated[i] = { ...updated[i], ...e.detail.value };
      this._config = { ...this._config, entities: updated };
      this._fire();
    });
    
    content.appendChild(form);
    row.appendChild(content);

    const delIcon = document.createElement('ha-icon');
    delIcon.setAttribute('icon', 'mdi:delete');
    delIcon.addEventListener('click', () => {
      const updated = [...(this._config.entities || [])];
      updated.splice(i, 1);
      this._config = { ...this._config, entities: updated };
      this._fire(); this._render();
    });
    row.appendChild(delIcon);

    return row;
  }
}

customElements.define('ceiling-fan-card', CeilingFanCard);
customElements.define('ceiling-fan-card-editor', CeilingFanCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'ceiling-fan-card',
  name: 'Ceiling Fan Card',
  description: 'כרטיס מאוורר תקרה — 3 להבים, תמיכה בכיוון מובנה או ישות נפרדת',
  preview: true,
});
