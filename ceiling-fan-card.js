/**
 * ceiling-fan-card — Home Assistant Lovelace Custom Card
 * https://github.com/YOUR_USERNAME/ceiling-fan-card
 *
 * Installation via HACS:
 *   1. HACS → Frontend → Custom repositories → add this repo URL → Category: Lovelace
 *   2. Install "Ceiling Fan Card"
 *   3. Hard-refresh browser (Ctrl+Shift+R)
 *
 * Manual installation:
 *   1. Copy ceiling-fan-card.js → /config/www/ceiling-fan-card.js
 *   2. Settings → Dashboards → Resources → Add:
 *      /local/ceiling-fan-card.js  |  JavaScript Module
 *
 * Usage (YAML):
 *   type: custom:ceiling-fan-card
 *   entity: fan.my_ceiling_fan
 *   name: מאוורר סלון             # optional
 *   speed_names:                   # optional — Hebrew speed labels
 *     - חלש מאוד
 *     - חלש
 *     - בינוני-חלש
 *     - בינוני
 *     - חזק
 *     - חזק מאוד
 *   extra_entity:                  # optional — any extra entity row
 *     entity: switch_timer.toggle_fan
 *     name: טיימר מאוורר          # optional label
 *     tap_action:
 *       action: toggle
 */

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Heebo:wght@300;400;700&display=swap');

  :host { display: block; font-family: 'Heebo', sans-serif; }

  ha-card {
    background: linear-gradient(145deg, #16161e, #1e1e2e);
    border-radius: 24px;
    padding: 28px 24px 24px;
    border: 1px solid rgba(255,255,255,0.07);
    box-shadow: 0 0 0 1px rgba(0,0,0,0.5), 0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07);
    position: relative; overflow: hidden; color: white;
  }
  ha-card::before {
    content: '';
    position: absolute;
    top: -60px; left: -60px; right: -60px; height: 160px;
    background: radial-gradient(ellipse at 50% 0%, rgba(56,189,248,0.1) 0%, transparent 70%);
    pointer-events: none;
  }

  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
  .label  { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 3px; }
  .title  { font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 2px; color: #fff; line-height: 1; }
  .badge  { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.2); margin-top: 2px; transition: color .3s; }
  .badge.on { color: #38bdf8; }

  .power-btn {
    width: 40px; height: 40px; border-radius: 50%;
    border: 1.5px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: all .3s;
  }
  .power-btn.on { border-color: rgba(56,189,248,0.5); box-shadow: 0 0 16px rgba(56,189,248,0.25); }
  .power-btn svg { width: 18px; height: 18px; stroke: rgba(255,255,255,0.35); fill: none; stroke-width: 2; stroke-linecap: round; transition: stroke .3s; }
  .power-btn.on svg { stroke: #38bdf8; }

  .fan-wrap { display: flex; flex-direction: column; align-items: center; margin-bottom: 20px; position: relative; height: 130px; }
  .fan-glow { position: absolute; width: 160px; height: 160px; border-radius: 50%; background: radial-gradient(circle, rgba(56,189,248,0.18) 0%, transparent 70%); opacity: 0; transition: opacity .5s; }
  .fan-glow.active { opacity: 1; }
  .fan-svg { width: 120px; height: 120px; filter: drop-shadow(0 0 10px rgba(56,189,248,0.12)); position: relative; z-index: 1; }
  .fan-blade { fill: rgba(255,255,255,0.07); stroke: rgba(255,255,255,0.12); stroke-width: .5; transition: fill .4s; }
  .fan-group { transform-origin: 60px 60px; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  .speed-display { text-align: center; margin-bottom: 16px; }
  .speed-name { font-size: 26px; font-weight: 700; line-height: 1; color: #38bdf8; text-shadow: 0 0 20px rgba(56,189,248,0.4); transition: all .3s; letter-spacing: 1px; }
  .speed-name.off { color: rgba(255,255,255,0.15); text-shadow: none; }
  .speed-label { font-size: 10px; letter-spacing: 4px; color: rgba(255,255,255,0.25); text-transform: uppercase; margin-top: 2px; }

  .controls { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 20px; }

  .spd-btn {
    border-radius: 10px; border: 1.5px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
    cursor: pointer; padding: 8px 4px; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 3px;
    transition: all .2s; color: white; position: relative; overflow: hidden;
  }
  .spd-btn::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 0; background: linear-gradient(to top, rgba(56,189,248,0.2), transparent); transition: height .25s; }
  .spd-btn:hover { border-color: rgba(56,189,248,0.3); transform: translateY(-1px); }
  .spd-btn:hover::after { height: 100%; }
  .spd-btn.active { border-color: rgba(56,189,248,0.6); background: rgba(56,189,248,0.1); box-shadow: 0 0 14px rgba(56,189,248,0.15), inset 0 1px 0 rgba(56,189,248,0.2); }
  .spd-btn.active::after { height: 100%; }

  .btn-lbl { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.3); line-height: 1.2; transition: color .2s; position: relative; z-index: 1; direction: rtl; text-align: center; }
  .spd-btn.active .btn-lbl { color: #38bdf8; }
  .btn-dot { width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,0.15); transition: background .2s; position: relative; z-index: 1; }
  .spd-btn.active .btn-dot { background: #38bdf8; }

  /* Extra entity row */
  .extra-row {
    display: flex; align-items: center; gap: 10px;
    border-top: 1px solid rgba(255,255,255,0.06);
    padding-top: 14px; margin-bottom: 14px;
    cursor: pointer; border-radius: 8px; padding: 10px 6px;
    transition: background .2s;
  }
  .extra-row:hover { background: rgba(255,255,255,0.03); }
  .extra-icon {
    width: 32px; height: 32px; border-radius: 8px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all .3s;
  }
  .extra-icon.on { background: rgba(56,189,248,0.12); border-color: rgba(56,189,248,0.3); }
  .extra-icon svg { width: 15px; height: 15px; stroke: rgba(255,255,255,0.3); fill: none; stroke-width: 1.5; stroke-linecap: round; transition: stroke .3s; }
  .extra-icon.on svg { stroke: #38bdf8; }
  .extra-info { flex: 1; min-width: 0; }
  .extra-name { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.6); }
  .extra-entity { font-size: 10px; color: rgba(255,255,255,0.2); font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .extra-state { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.2); transition: color .3s; flex-shrink: 0; }
  .extra-state.on { color: #38bdf8; }

  .stats { display: flex; justify-content: space-between; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.06); }
  .stat { text-align: center; flex: 1; }
  .stat-val { font-family: 'Bebas Neue', sans-serif; font-size: 20px; color: rgba(255,255,255,0.6); transition: color .3s; }
  .stat-val.active { color: #38bdf8; }
  .stat-key { font-size: 9px; letter-spacing: 2px; color: rgba(255,255,255,0.2); text-transform: uppercase; margin-top: 1px; }
  .divider { width: 1px; background: rgba(255,255,255,0.06); align-self: stretch; }
`;

const DEFAULT_SPEED_NAMES = ['חלש מאוד', 'חלש', 'בינוני-חלש', 'בינוני', 'חזק', 'חזק מאוד'];
const SPIN_DURATIONS      = [3, 1.8, 1.1, 0.7, 0.45, 0.28];
const SPEED_RPM           = [180, 310, 450, 600, 780, 980];
const SPEED_WATT          = [12, 22, 35, 50, 68, 85];
const SPEED_FLOW          = [14, 26, 40, 56, 74, 96];
const BLADE_OPS           = [0.08, 0.12, 0.18, 0.24, 0.32, 0.42];
const SPEED_PCT           = [17, 33, 50, 67, 83, 100];

class CeilingFanCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._built = false;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._built) { this._build(); this._built = true; }
    this._sync();
  }

  setConfig(config) {
    if (!config.entity) throw new Error('entity is required');
    this._config      = config;
    this._entity      = config.entity;
    this._name        = config.name || null;
    this._count       = 6;
    this._speedNames  = config.speed_names || DEFAULT_SPEED_NAMES;
    this._extra       = config.extra_entity || null;
    if (this._built) { this._built = false; this._build(); this._built = true; }
  }

  getCardSize() { return this._extra ? 6 : 5; }

  static getConfigElement() {
    return document.createElement('ceiling-fan-card-editor');
  }

  static getStubConfig() {
    return { entity: 'fan.my_ceiling_fan' };
  }

  /* ─── Build DOM ─── */
  _build() {
    const r = this.shadowRoot;
    r.innerHTML = '';
    const style = document.createElement('style');
    style.textContent = STYLES;
    r.appendChild(style);

    const card = document.createElement('ha-card');
    const names = this._speedNames;

    const btnHtml = names.map((lbl, i) =>
      `<button class="spd-btn" data-idx="${i}">
        <div class="btn-lbl">${lbl}</div>
        <div class="btn-dot"></div>
      </button>`
    ).join('');

    const extraHtml = this._extra ? `
      <div class="extra-row" id="extra-row">
        <div class="extra-icon" id="extra-icon">
          <svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
        </div>
        <div class="extra-info">
          <div class="extra-name">${this._extra.name || this._extra.entity}</div>
          <div class="extra-entity">${this._extra.entity}</div>
        </div>
        <div class="extra-state" id="extra-state">—</div>
      </div>` : '';

    card.innerHTML = `
      <div class="header">
        <div>
          <div class="label">בקרת אקלים</div>
          <div class="title" id="name">מאוורר תקרה</div>
          <div class="badge" id="badge">כבוי</div>
        </div>
        <button class="power-btn" id="power">
          <svg viewBox="0 0 24 24"><path d="M12 2v6M6.3 6.3A8 8 0 1 0 17.7 6.3"/></svg>
        </button>
      </div>

      <div class="fan-wrap">
        <div class="fan-glow" id="glow"></div>
        <svg class="fan-svg" viewBox="0 0 120 120">
          <rect x="58" y="0" width="4" height="18" rx="2" fill="rgba(255,255,255,0.1)"/>
          <circle cx="60" cy="26" r="10" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
          <g class="fan-group" id="blades">
            <ellipse class="fan-blade" cx="60" cy="46" rx="9" ry="24" transform="rotate(0 60 60)"/>
            <ellipse class="fan-blade" cx="60" cy="46" rx="9" ry="24" transform="rotate(90 60 60)"/>
            <ellipse class="fan-blade" cx="60" cy="46" rx="9" ry="24" transform="rotate(180 60 60)"/>
            <ellipse class="fan-blade" cx="60" cy="46" rx="9" ry="24" transform="rotate(270 60 60)"/>
          </g>
          <circle cx="60" cy="60" r="8" fill="#0f172a" stroke="rgba(56,189,248,0.25)" stroke-width="1"/>
          <circle cx="60" cy="60" r="4.5" fill="#38bdf8"/>
        </svg>
      </div>

      <div class="speed-display">
        <div class="speed-name off" id="spname">כבוי</div>
        <div class="speed-label">מצב</div>
      </div>

      <div class="controls">${btnHtml}</div>

      ${extraHtml}

      <div class="stats">
        <div class="stat"><div class="stat-val" id="s-rpm">0</div><div class="stat-key">סל״ד</div></div>
        <div class="divider"></div>
        <div class="stat"><div class="stat-val" id="s-watt">0W</div><div class="stat-key">צריכה</div></div>
        <div class="divider"></div>
        <div class="stat"><div class="stat-val" id="s-flow">0</div><div class="stat-key">CMM</div></div>
      </div>
    `;

    r.appendChild(card);

    r.getElementById('power').addEventListener('click', () => this._togglePower());
    r.querySelectorAll('.spd-btn').forEach(b =>
      b.addEventListener('click', () => this._setSpeed(parseInt(b.dataset.idx) + 1))
    );

    if (this._extra) {
      r.getElementById('extra-row').addEventListener('click', () => this._handleExtraTap());
    }
  }

  /* ─── Sync from HA state ─── */
  _sync() {
    const obj = this._hass?.states[this._entity];
    if (!obj) return;

    const isOn = obj.state === 'on';
    const pct  = obj.attributes.percentage || 0;
    const lvl  = isOn && pct > 0
      ? SPEED_PCT.slice(0, this._count).reduce((best, p, i) =>
          Math.abs(p - pct) < Math.abs(SPEED_PCT[best - 1] - pct) ? i + 1 : best, 1)
      : 0;

    const nameEl = this.shadowRoot.getElementById('name');
    if (nameEl) nameEl.textContent = this._name || obj.attributes.friendly_name || 'מאוורר תקרה';

    this._render(isOn, lvl);
    this._syncExtra();
  }

  /* ─── Sync extra entity row ─── */
  _syncExtra() {
    if (!this._extra) return;
    const r = this.shadowRoot;
    const obj = this._hass?.states[this._extra.entity];
    const icon  = r.getElementById('extra-icon');
    const state = r.getElementById('extra-state');
    if (!obj || !icon || !state) return;

    const isOn = obj.state === 'on';
    icon.classList.toggle('on', isOn);
    state.textContent = isOn ? 'פעיל' : 'כבוי';
    state.classList.toggle('on', isOn);
  }

  /* ─── Render visuals ─── */
  _render(isOn, lvl) {
    const $ = id => this.shadowRoot.getElementById(id);
    const $$ = sel => this.shadowRoot.querySelectorAll(sel);

    $('power').classList.toggle('on', isOn);
    $('badge').textContent = isOn ? 'פועל' : 'כבוי';
    $('badge').classList.toggle('on', isOn);
    $('glow').classList.toggle('active', isOn && lvl > 0);

    $('blades').style.animation = isOn && lvl > 0
      ? `spin ${SPIN_DURATIONS[lvl-1]}s linear infinite` : 'none';

    $$('.fan-blade').forEach(b => {
      b.style.fill = isOn && lvl > 0
        ? `rgba(56,189,248,${BLADE_OPS[lvl-1]})` : 'rgba(255,255,255,0.07)';
    });

    const spname = $('spname');
    spname.textContent = isOn && lvl > 0 ? this._speedNames[lvl - 1] : 'כבוי';
    spname.classList.toggle('off', !isOn || lvl === 0);

    $$('.spd-btn').forEach(b =>
      b.classList.toggle('active', isOn && parseInt(b.dataset.idx) === lvl - 1)
    );

    const active = isOn && lvl > 0;
    this._animateTo($('s-rpm'),  active ? SPEED_RPM[lvl-1]  : 0, '');
    this._animateTo($('s-watt'), active ? SPEED_WATT[lvl-1] : 0, 'W');
    this._animateTo($('s-flow'), active ? SPEED_FLOW[lvl-1] : 0, '');
    [$('s-rpm'), $('s-watt'), $('s-flow')].forEach(el => el.classList.toggle('active', active));
  }

  _animateTo(el, target, sfx) {
    const from = parseInt(el.textContent) || 0;
    const t0 = performance.now();
    const step = now => {
      const p = Math.min((now - t0) / 400, 1);
      el.textContent = Math.round(from + (target - from) * (1 - Math.pow(1-p, 3))) + sfx;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ─── HA service calls ─── */
  _togglePower() {
    const isOn = this._hass?.states[this._entity]?.state === 'on';
    this._hass.callService('fan', isOn ? 'turn_off' : 'turn_on', { entity_id: this._entity });
  }

  _setSpeed(n) {
    this._hass.callService('fan', 'turn_on', {
      entity_id: this._entity,
      percentage: SPEED_PCT[n - 1],
    });
  }

  _handleExtraTap() {
    if (!this._extra || !this._hass) return;
    const action = this._extra.tap_action?.action || 'toggle';
    const entity  = this._extra.entity;
    const [domain] = entity.split('.');

    if (action === 'toggle') {
      this._hass.callService(domain, 'toggle', { entity_id: entity });
    } else if (action === 'more-info') {
      const ev = new CustomEvent('hass-more-info', { detail: { entityId: entity }, bubbles: true, composed: true });
      this.dispatchEvent(ev);
    } else if (action === 'call-service') {
      const { service, service_data } = this._extra.tap_action;
      const [svc_domain, svc_name] = service.split('.');
      this._hass.callService(svc_domain, svc_name, service_data || {});
    } else if (action === 'navigate') {
      history.pushState(null, '', this._extra.tap_action.navigation_path);
      const ev = new CustomEvent('location-changed', { bubbles: true, composed: true });
      window.dispatchEvent(ev);
    }
  }
}

/* ══════════════════════════════
   Visual Editor
══════════════════════════════ */
const EDITOR_STYLES = `
  .wrap { font-family: sans-serif; padding: 4px 0; }
  .sec-title { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--secondary-text-color); margin: 16px 0 8px; border-bottom: 1px solid var(--divider-color); padding-bottom: 4px; }
  .field { margin-bottom: 10px; }
  .speed-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
  .field-lbl { font-size: 12px; color: var(--secondary-text-color); margin-bottom: 4px; }
  ha-textfield { width: 100%; }
  ha-select { width: 100%; }
  ha-formfield { display: block; margin-bottom: 8px; }
  .toggle-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; }
  .toggle-label { font-size: 14px; color: var(--primary-text-color); }
  .toggle-sub { font-size: 12px; color: var(--secondary-text-color); }
  .extra-block { padding: 12px; background: var(--secondary-background-color); border-radius: 8px; margin-top: 8px; }
`;

class CeilingFanCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) { this._hass = hass; }

  _fire() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this._config }, bubbles: true, composed: true
    }));
  }

  _render() {
    const r = this.shadowRoot;
    r.innerHTML = '';
    const style = document.createElement('style');
    style.textContent = EDITOR_STYLES;
    r.appendChild(style);

    const wrap = document.createElement('div');
    wrap.className = 'wrap';

    const names = this._config.speed_names || DEFAULT_SPEED_NAMES;
    const extra = this._config.extra_entity || null;
    const hasExtra = !!extra;
    const tapAction = extra?.tap_action?.action || 'toggle';

    const speedInputs = names.map((n, i) => `
      <div class="field">
        <div class="field-lbl">מהירות ${i+1}</div>
        <ha-textfield data-speed="${i}" value="${n}" style="width:100%"></ha-textfield>
      </div>`).join('');

    wrap.innerHTML = `
      <div class="sec-title">מאוורר</div>
      <div class="field">
        <ha-textfield id="f-entity" label="Entity (fan.*)" value="${this._config.entity || ''}" style="width:100%"></ha-textfield>
      </div>
      <div class="field">
        <ha-textfield id="f-name" label="שם מותאם (אופציונלי)" value="${this._config.name || ''}" style="width:100%"></ha-textfield>
      </div>

      <div class="sec-title">שמות מהירויות</div>
      <div class="speed-grid">${speedInputs}</div>

      <div class="sec-title">ישות נוספת</div>
      <div class="toggle-row">
        <div>
          <div class="toggle-label">הוסף ישות לכרטיס</div>
          <div class="toggle-sub">כל ישות — switch, input_boolean, script ועוד</div>
        </div>
        <ha-switch id="extra-toggle" ${hasExtra ? 'checked' : ''}></ha-switch>
      </div>

      <div class="extra-block" id="extra-block" style="display:${hasExtra ? 'block' : 'none'}">
        <div class="field">
          <ha-textfield id="f-extra-entity" label="Entity" value="${extra?.entity || ''}" style="width:100%"></ha-textfield>
        </div>
        <div class="field">
          <ha-textfield id="f-extra-name" label="תווית (אופציונלי)" value="${extra?.name || ''}" style="width:100%"></ha-textfield>
        </div>
        <div class="field">
          <ha-select id="f-tap" label="tap_action" value="${tapAction}" style="width:100%">
            <mwc-list-item value="toggle">toggle</mwc-list-item>
            <mwc-list-item value="more-info">more-info</mwc-list-item>
            <mwc-list-item value="call-service">call-service</mwc-list-item>
            <mwc-list-item value="navigate">navigate</mwc-list-item>
            <mwc-list-item value="none">none</mwc-list-item>
          </ha-select>
        </div>
      </div>
    `;

    r.appendChild(wrap);

    // Events
    r.getElementById('f-entity').addEventListener('change', e => {
      this._config = { ...this._config, entity: e.target.value }; this._fire();
    });
    r.getElementById('f-name').addEventListener('change', e => {
      this._config = { ...this._config, name: e.target.value || undefined }; this._fire();
    });

    r.querySelectorAll('[data-speed]').forEach(el => {
      el.addEventListener('change', e => {
        const names = [...(this._config.speed_names || DEFAULT_SPEED_NAMES)];
        names[parseInt(e.target.dataset.speed)] = e.target.value;
        this._config = { ...this._config, speed_names: names }; this._fire();
      });
    });

    const extraBlock = r.getElementById('extra-block');
    r.getElementById('extra-toggle').addEventListener('change', e => {
      extraBlock.style.display = e.target.checked ? 'block' : 'none';
      if (!e.target.checked) {
        const { extra_entity, ...rest } = this._config;
        this._config = rest;
      } else {
        this._config = { ...this._config, extra_entity: { entity: '' } };
      }
      this._fire();
    });

    r.getElementById('f-extra-entity').addEventListener('change', e => {
      this._config = { ...this._config, extra_entity: { ...this._config.extra_entity, entity: e.target.value } };
      this._fire();
    });
    r.getElementById('f-extra-name').addEventListener('change', e => {
      this._config = { ...this._config, extra_entity: { ...this._config.extra_entity, name: e.target.value || undefined } };
      this._fire();
    });
    r.getElementById('f-tap').addEventListener('selected', e => {
      this._config = { ...this._config, extra_entity: { ...this._config.extra_entity, tap_action: { action: e.detail.value } } };
      this._fire();
    });
  }
}

customElements.define('ceiling-fan-card', CeilingFanCard);
customElements.define('ceiling-fan-card-editor', CeilingFanCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'ceiling-fan-card',
  name:        'Ceiling Fan Card',
  description: 'כרטיס מאוורר תקרה עם שמות מהירויות וישות נוספת',
  preview:     true,
});
