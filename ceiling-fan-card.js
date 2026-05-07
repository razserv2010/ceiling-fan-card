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
 *   name: מאוורר סלון
 *   speed_names:
 *     - חלש מאוד
 *     - חלש
 *     - בינוני-חלש
 *     - בינוני
 *     - חזק
 *     - חזק מאוד
 *   extra_entity:
 *     entity: switch_timer.toggle_fan
 *     name: טיימר מאוורר
 *     tap_action:
 *       action: toggle
 */

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;600;700;800&display=swap');

  :host { display: block; font-family: 'Heebo', sans-serif; }

  ha-card {
    background: linear-gradient(145deg, #1c2033, #161926);
    border-radius: 28px;
    padding: 24px 22px 20px;
    border: 1px solid rgba(255,255,255,0.07);
    box-shadow: 0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
    position: relative; overflow: hidden; color: white;
  }
  ha-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 3px;
    border-radius: 28px 28px 0 0;
    background: linear-gradient(90deg, #6366f1, #0ea5e9, #06b6d4);
  }

  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
  .title  { font-size: 15px; font-weight: 800; color: #f1f5f9; line-height: 1; }
  .sub    { font-size: 10px; color: rgba(255,255,255,0.22); margin-top: 1px; }

  .power-btn {
    width: 34px; height: 34px; border-radius: 50%;
    border: 1.5px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.05);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: all .35s;
  }
  .power-btn.on { border-color: rgba(99,102,241,0.6); box-shadow: 0 0 12px rgba(99,102,241,0.3); }
  .power-btn svg { width: 14px; height: 14px; stroke: rgba(255,255,255,0.3); fill: none; stroke-width: 2; stroke-linecap: round; transition: stroke .3s; }
  .power-btn.on svg { stroke: #818cf8; }
  .btns { display: flex; align-items: center; gap: 8px; }

  .fan-center { display: flex; flex-direction: column; align-items: center; gap: 10px; position: relative; margin-bottom: 14px; }
  .fan-glow {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -54%);
    width: 130px; height: 130px; border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,0.15), transparent 65%);
    opacity: 0; transition: opacity .5s; pointer-events: none;
  }
  .fan-glow.active { opacity: 1; }
  .fan-svg { width: 120px; height: 120px; overflow: visible; }
  .fan-blade { transition: fill .4s, stroke .4s; }

  .speed-name {
    font-size: 20px; font-weight: 800; color: #818cf8;
    text-shadow: 0 0 14px rgba(99,102,241,0.35);
    transition: color .3s, text-shadow .3s;
  }
  .speed-name.off { color: rgba(255,255,255,0.12); text-shadow: none; }

  .controls { display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; margin-bottom: 14px; }

  .spd-btn {
    border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.03);
    cursor: pointer; padding: 7px 2px 6px;
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    transition: all .2s;
  }
  .spd-btn:hover { border-color: rgba(99,102,241,0.3); background: rgba(99,102,241,0.07); transform: translateY(-1px); }
  .spd-btn.active { border-color: rgba(99,102,241,0.5); background: rgba(99,102,241,0.12); box-shadow: 0 0 10px rgba(99,102,241,0.12); }
  .btn-lbl { font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.22); line-height: 1.15; text-align: center; direction: rtl; transition: color .2s; }
  .spd-btn.active .btn-lbl { color: #a5b4fc; }
  .bars { display: flex; gap: 1.5px; align-items: flex-end; height: 9px; }
  .bar { width: 3px; border-radius: 2px; background: rgba(255,255,255,0.1); transition: background .2s; }
  .spd-btn.active .bar { background: #818cf8; }

  /* extra entity — icon button next to power */
  .btns { display: flex; align-items: center; gap: 8px; }
  .extra-btn {
    width: 34px; height: 34px; border-radius: 50%; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    border: 1.5px solid rgba(251,191,36,0.4);
    background: rgba(251,191,36,0.08);
    box-shadow: 0 0 10px rgba(251,191,36,0.15);
    transition: box-shadow .3s;
  }
  .extra-btn:hover { box-shadow: 0 0 16px rgba(251,191,36,0.28); }
  .extra-btn svg { width: 15px; height: 15px; fill: none; stroke: #fbbf24; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
`;

const DEFAULT_SPEED_NAMES = ['חלש מאוד', 'חלש', 'בינוני-חלש', 'בינוני', 'חזק', 'חזק מאוד'];
const TARGET_DURS  = [3.5, 2.0, 1.2, 0.75, 0.45, 0.27]; // sec/rotation per speed
const BLADE_OPS    = [[0.24,0.19],[0.28,0.22],[0.32,0.26],[0.38,0.30],[0.44,0.36],[0.52,0.44]];
const SPEED_PCT    = [17, 33, 50, 67, 83, 100];
const BAR_H        = [[4],[4,7],[4,7,9],[4,7,9,11],[4,7,9,11,13],[4,7,9,11,13,15]];

class CeilingFanCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._built      = false;
    this._angle      = 0;
    this._currentDur = TARGET_DURS[2];
    this._rafId      = null;
    this._lastTs     = null;
    this._decelerating = false;
    this._isOn       = false;
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
    this._speedNames = config.speed_names || DEFAULT_SPEED_NAMES;
    this._extra      = config.extra_entity || null;
    if (this._built) { this._built = false; this._build(); this._built = true; }
  }

  getCardSize() { return this._extra ? 6 : 5; }
  static getConfigElement() { return document.createElement('ceiling-fan-card-editor'); }
  static getStubConfig()    { return { entity: 'fan.my_ceiling_fan' }; }

  /* ── Build DOM ── */
  _build() {
    const r = this.shadowRoot;
    r.innerHTML = '';
    const style = document.createElement('style');
    style.textContent = STYLES;
    r.appendChild(style);

    const card = document.createElement('ha-card');

    const btnHtml = this._speedNames.map((lbl, i) => {
      const bars = BAR_H[i].map(h => `<div class="bar" style="height:${h}px"></div>`).join('');
      return `<button class="spd-btn" data-idx="${i}">
        <div class="btn-lbl">${lbl}</div>
        <div class="bars">${bars}</div>
      </button>`;
    }).join('');



    card.innerHTML = `
      <div class="header">
        <div>
          <div class="title" id="name">מאוורר תקרה</div>

        </div>
        <button class="power-btn" id="power">
          <svg viewBox="0 0 24 24"><path d="M12 2v6M6.3 6.3A8 8 0 1 0 17.7 6.3"/></svg>
        </button>
      </div>

      <div class="fan-center">
        <div class="fan-glow" id="glow"></div>
        <svg class="fan-svg" viewBox="0 0 104 104">
          <rect x="50" y="0" width="4" height="14" rx="2" fill="rgba(255,255,255,0.1)"/>
          <ellipse cx="52" cy="18" rx="10" ry="5" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.09)" stroke-width="0.8"/>
          <g id="blades">
            <ellipse class="fan-blade" id="b1" cx="52" cy="27" rx="7" ry="26"
              transform="rotate(0 52 52)" fill="rgba(99,102,241,0.24)" stroke="rgba(99,102,241,0.32)" stroke-width="0.5"/>
            <ellipse class="fan-blade" id="b2" cx="52" cy="27" rx="7" ry="26"
              transform="rotate(120 52 52)" fill="rgba(99,102,241,0.19)" stroke="rgba(99,102,241,0.26)" stroke-width="0.5"/>
            <ellipse class="fan-blade" id="b3" cx="52" cy="27" rx="7" ry="26"
              transform="rotate(240 52 52)" fill="rgba(99,102,241,0.24)" stroke="rgba(99,102,241,0.32)" stroke-width="0.5"/>
          </g>
          <circle cx="52" cy="52" r="10" fill="#1a1d2e" stroke="rgba(99,102,241,0.28)" stroke-width="1"/>
          <circle cx="52" cy="52" r="6" fill="url(#hg)" stroke="rgba(99,102,241,0.18)" stroke-width="0.8"/>
          <circle cx="52" cy="52" r="2.8" fill="#818cf8" opacity="0.9"/>
          <defs>
            <radialGradient id="hg" cx="35%" cy="35%">
              <stop offset="0%" stop-color="rgba(155,160,225,0.9)"/>
              <stop offset="100%" stop-color="rgba(75,80,145,0.85)"/>
            </radialGradient>
          </defs>
        </svg>
        <div class="speed-name off" id="spname">כבוי</div>
      </div>

      <div class="controls">${btnHtml}</div>

    `;

    r.appendChild(card);

    r.getElementById('power').addEventListener('click', () => this._togglePower());
    r.querySelectorAll('.spd-btn').forEach(b =>
      b.addEventListener('click', () => this._setSpeed(parseInt(b.dataset.idx) + 1))
    );
    if (this._extra) {
      const btn = r.getElementById('extra-btn');
      if (btn) {
        btn.addEventListener('click', () => this._handleExtraTap());
        // Use ha-icon if mdi icon specified
        if (this._extra.icon) {
          const haIcon = document.createElement('ha-icon');
          haIcon.setAttribute('icon', this._extra.icon);
          haIcon.style.cssText = '--mdc-icon-size:18px; color:#fbbf24;';
          btn.innerHTML = '';
          btn.appendChild(haIcon);
        }
      }
    }
  }

  /* ── Sync from HA ── */
  _sync() {
    const obj = this._hass?.states[this._entity];
    if (!obj) return;

    const isOn = obj.state === 'on';
    const pct  = obj.attributes.percentage || 0;
    const lvl  = isOn && pct > 0
      ? SPEED_PCT.reduce((best, p, i) =>
          Math.abs(p - pct) < Math.abs(SPEED_PCT[best-1] - pct) ? i+1 : best, 1)
      : 0;

    const nameEl = this.shadowRoot.getElementById('name');
    if (nameEl) nameEl.textContent = this._name || obj.attributes.friendly_name || 'מאוורר תקרה';

    if (isOn && lvl > 0) {
      this._startSpin(lvl);
    } else if (!isOn && this._isOn) {
      this._startDecelerate();
    }
    this._isOn = isOn;

    this._updateUI(isOn, lvl);
    this._syncExtra();
  }

  _updateUI(isOn, lvl) {
    const $ = id => this.shadowRoot.getElementById(id);
    const $$ = sel => this.shadowRoot.querySelectorAll(sel);

    $('power').classList.toggle('on', isOn);
    $('glow').classList.toggle('active', isOn && lvl > 0);

    const spname = $('spname');
    if (isOn && lvl > 0) {
      spname.textContent = this._speedNames[lvl-1];
      spname.classList.remove('off');
    } else if (!isOn) {
      // text updates after stop in decelerate loop
    }

    $$('.spd-btn').forEach(b =>
      b.classList.toggle('active', isOn && parseInt(b.dataset.idx) === lvl-1)
    );

    if (isOn && lvl > 0) this._setBladeColors(lvl-1);
  }

  _syncExtra() {
    // extra entity is now an icon button — no state display needed
  }

  /* ── Fan rotation (JS-driven) ── */
  _applyAngle() {
    this.shadowRoot.getElementById('blades')
      ?.setAttribute('transform', `rotate(${this._angle} 52 52)`);
  }

  _setBladeColors(idx) {
    const [o1, o2] = BLADE_OPS[idx];
    const r = this.shadowRoot;
    r.getElementById('b1')?.setAttribute('fill', `rgba(99,102,241,${o1})`);
    r.getElementById('b1')?.setAttribute('stroke', `rgba(99,102,241,${o1+0.1})`);
    r.getElementById('b2')?.setAttribute('fill', `rgba(99,102,241,${o2})`);
    r.getElementById('b2')?.setAttribute('stroke', `rgba(99,102,241,${o2+0.08})`);
    r.getElementById('b3')?.setAttribute('fill', `rgba(99,102,241,${o1})`);
    r.getElementById('b3')?.setAttribute('stroke', `rgba(99,102,241,${o1+0.1})`);
  }

  _startSpin(lvl) {
    this._decelerating = false;
    this._currentDur   = TARGET_DURS[lvl-1];
    if (!this._rafId) {
      this._lastTs = null;
      this._rafId  = requestAnimationFrame(ts => this._loop(ts));
    }
  }

  _startDecelerate() {
    this._decelerating = true;
    if (!this._rafId) {
      this._lastTs = null;
      this._rafId  = requestAnimationFrame(ts => this._loop(ts));
    }
  }

  _loop(ts) {
    if (!this._lastTs) this._lastTs = ts;
    const dt = Math.min((ts - this._lastTs) / 1000, 0.05);
    this._lastTs = ts;

    if (this._decelerating) {
      this._currentDur += dt * 5.0;
      if (this._currentDur >= 20) {
        // fully stopped
        this._decelerating = false;
        this._rafId = null;
        const spname = this.shadowRoot.getElementById('spname');
        if (spname) { spname.textContent = 'כבוי'; spname.classList.add('off'); }
        return;
      }
    }

    const dps = 360 / this._currentDur;
    this._angle = (this._angle + dps * dt) % 360;
    this._applyAngle();
    this._rafId = requestAnimationFrame(ts => this._loop(ts));
  }

  /* ── HA service calls ── */
  _togglePower() {
    const isOn = this._hass?.states[this._entity]?.state === 'on';
    this._hass.callService('fan', isOn ? 'turn_off' : 'turn_on', { entity_id: this._entity });
  }

  _setSpeed(n) {
    this._hass.callService('fan', 'turn_on', {
      entity_id: this._entity,
      percentage: SPEED_PCT[n-1],
    });
  }

  _handleExtraTap() {
    if (!this._extra || !this._hass) return;
    const tapAction = this._extra.tap_action;
    const action    = tapAction?.action || 'more-info';
    const entity    = this._extra.entity;

    // Use the same action handler as HA built-in cards
    const event = new CustomEvent('hass-action', {
      bubbles: true,
      composed: true,
      detail: {
        config: {
          entity: entity,
          tap_action: tapAction,
        },
        action: 'tap',
      },
    });
    this.dispatchEvent(event);
  }
}

/* ══════════════════════════════
   Visual Editor
══════════════════════════════ */
const EDITOR_STYLES = `
  :host { display: block; }
  .wrap { padding: 4px 0; }
  .sec-title {
    font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
    color: var(--secondary-text-color);
    margin: 18px 0 10px; padding-bottom: 5px;
    border-bottom: 1px solid var(--divider-color);
  }
  .field { margin-bottom: 12px; }
  .speed-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
  ha-textfield { width: 100%; display: block; }
  ha-select    { width: 100%; display: block; }
  .toggle-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 12px;
    background: var(--secondary-background-color);
    border-radius: 8px; cursor: pointer;
  }
  .toggle-lbl { font-size: 14px; color: var(--primary-text-color); }
  .toggle-sub { font-size: 12px; color: var(--secondary-text-color); margin-top: 2px; }
  .extra-block {
    margin-top: 10px; padding: 12px;
    background: var(--secondary-background-color);
    border-radius: 8px;
  }
  ha-entity-picker { width: 100%; display: block; margin-bottom: 12px; }
  .field-lbl { font-size: 12px; color: var(--secondary-text-color); display: block; margin-bottom: 4px; }
  select {
    width: 100%; padding: 8px 10px;
    border-radius: 4px;
    border: 1px solid var(--divider-color);
    background: var(--secondary-background-color);
    color: var(--primary-text-color);
    font-size: 14px; cursor: pointer;
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
    this.shadowRoot.querySelectorAll('ha-entity-picker').forEach(el => el.hass = hass);
  }

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

    const names    = this._config.speed_names || DEFAULT_SPEED_NAMES;
    const extra    = this._config.extra_entity || null;
    const hasExtra = !!extra;

    const speedInputs = names.map((n, i) => `
      <div class="field">
        <ha-textfield data-speed="${i}" label="מהירות ${i+1}" value="${n}"></ha-textfield>
      </div>`).join('');

    wrap.innerHTML = `
      <div class="sec-title">מאוורר</div>
      <div class="field" id="fan-picker-wrap"></div>
      <div class="field">
        <ha-textfield id="f-name" label="שם מותאם (אופציונלי)" value="${this._config.name || ''}"></ha-textfield>
      </div>

      <div class="sec-title">שמות מהירויות</div>
      <div class="speed-grid">${speedInputs}</div>

      <div class="sec-title">ישות נוספת</div>
      <div class="toggle-row" id="extra-toggle">
        <div>
          <div class="toggle-lbl">הוסף ישות לכרטיס</div>
          <div class="toggle-sub">כל ישות — switch, input_boolean, script ועוד</div>
        </div>
        <ha-switch id="extra-sw" ${hasExtra ? 'checked' : ''}></ha-switch>
      </div>
      <div class="extra-block" id="extra-block" style="display:${hasExtra ? 'block' : 'none'}">
        <div id="extra-picker-wrap"></div>
        <div class="field">
          <ha-textfield id="f-extra-name" label="תווית (אופציונלי)" value="${extra?.name || ''}"></ha-textfield>
        </div>
      </div>
    `;

    r.appendChild(wrap);

    // Fan entity picker
    const fanPicker = document.createElement('ha-entity-picker');
    fanPicker.label = 'Entity (fan.*)';
    fanPicker.value = this._config.entity || '';
    fanPicker.includeDomains = ['fan'];
    fanPicker.allowCustomEntity = false;
    if (this._hass) fanPicker.hass = this._hass;
    fanPicker.addEventListener('value-changed', e => {
      this._config = { ...this._config, entity: e.detail.value }; this._fire();
    });
    r.getElementById('fan-picker-wrap').appendChild(fanPicker);

    // Extra entity picker
    const extraPicker = document.createElement('ha-entity-picker');
    extraPicker.label = 'Entity';
    extraPicker.value = extra?.entity || '';
    extraPicker.allowCustomEntity = true;
    if (this._hass) extraPicker.hass = this._hass;
    extraPicker.addEventListener('value-changed', e => {
      this._config = { ...this._config, extra_entity: { ...this._config.extra_entity, entity: e.detail.value } };
      this._fire();
    });
    r.getElementById('extra-picker-wrap').appendChild(extraPicker);

    r.getElementById('f-name').addEventListener('change', e => {
      this._config = { ...this._config, name: e.target.value || undefined }; this._fire();
    });

    r.querySelectorAll('[data-speed]').forEach(el => {
      el.addEventListener('change', e => {
        const updated = [...(this._config.speed_names || DEFAULT_SPEED_NAMES)];
        updated[parseInt(e.target.dataset.speed)] = e.target.value;
        this._config = { ...this._config, speed_names: updated }; this._fire();
      });
    });

    const extraBlock = r.getElementById('extra-block');
    r.getElementById('extra-toggle').addEventListener('click', () => {
      const sw = r.getElementById('extra-sw');
      sw.checked = !sw.checked;
      extraBlock.style.display = sw.checked ? 'block' : 'none';
      if (!sw.checked) {
        const { extra_entity, ...rest } = this._config;
        this._config = rest;
      } else {
        this._config = { ...this._config, extra_entity: { entity: '' } };
      }
      this._fire();
    });

    r.getElementById('f-extra-name').addEventListener('change', e => {
      this._config = { ...this._config, extra_entity: { ...this._config.extra_entity, name: e.target.value || undefined } };
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
  description: 'כרטיס מאוורר תקרה — 3 להבים, עצירה הדרגתית, ישות נוספת',
  preview:     true,
});
