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
  .card-root {
    background: linear-gradient(145deg, #1c2033, #161926);
    border-radius: 28px; padding: 24px 22px 20px;
    border: 1px solid rgba(255,255,255,0.07);
    box-shadow: 0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
    position: relative; overflow: hidden; color: white; display: block;
  }
  .card-root::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    border-radius: 28px 28px 0 0;
    background: linear-gradient(90deg, #6366f1, #0ea5e9, #06b6d4);
  }

  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
  .title { font-size: 15px; font-weight: 800; color: #f1f5f9; line-height: 1; }
  .btns { display: flex; align-items: center; gap: 8px; }
  .power-btn {
    width: 34px; height: 34px; border-radius: 50%;
    border: 1.5px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05);
    cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .35s;
  }
  .power-btn.on { border-color: rgba(99,102,241,0.6); box-shadow: 0 0 12px rgba(99,102,241,0.3); }
  .power-btn svg { width: 14px; height: 14px; stroke: rgba(255,255,255,0.3); fill: none; stroke-width: 2; stroke-linecap: round; transition: stroke .3s; }
  .power-btn.on svg { stroke: #818cf8; }
  .extra-btn {
    width: 34px; height: 34px; border-radius: 50%; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    border: 1.5px solid rgba(251,191,36,0.4); background: rgba(251,191,36,0.08);
    box-shadow: 0 0 10px rgba(251,191,36,0.15); transition: box-shadow .3s;
  }
  .extra-btn:hover { box-shadow: 0 0 16px rgba(251,191,36,0.28); }
  .extra-btn svg { width: 15px; height: 15px; fill: none; stroke: #fbbf24; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
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
  .fan-blade-init { fill: color-mix(in srgb, var(--accent-color,#6366f1) 20%, transparent); stroke: color-mix(in srgb, var(--accent-color,#6366f1) 30%, transparent); }
  .speed-name { font-size: 20px; font-weight: 800; color: #818cf8; text-shadow: 0 0 14px rgba(99,102,241,0.35); transition: color .3s, text-shadow .3s; }
  .speed-name.off { color: rgba(255,255,255,0.12); text-shadow: none; }
  .controls { display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; margin-bottom: 14px; }
  .spd-btn {
    border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.03);
    cursor: pointer; padding: 7px 2px 6px; display: flex; flex-direction: column; align-items: center; gap: 3px; transition: all .2s;
  }
  .spd-btn:hover { border-color: rgba(99,102,241,0.3); background: rgba(99,102,241,0.07); transform: translateY(-1px); }
  .spd-btn.active { border-color: rgba(99,102,241,0.5); background: rgba(99,102,241,0.12); box-shadow: 0 0 10px rgba(99,102,241,0.12); }
  .btn-lbl { font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.22); line-height: 1.15; text-align: center; direction: rtl; transition: color .2s; }
  .spd-btn.active .btn-lbl { color: #a5b4fc; }
  .bars { display: flex; gap: 1.5px; align-items: flex-end; height: 9px; }
  .bar { width: 3px; border-radius: 2px; background: rgba(255,255,255,0.1); transition: background .2s; }
  .spd-btn.active .bar { background: #818cf8; }
`;

const DEFAULT_SPEED_NAMES = ['חלש מאוד', 'חלש', 'בינוני-חלש', 'בינוני', 'חזק', 'חזק מאוד'];
const TARGET_DURS = [3.5, 2.0, 1.2, 0.75, 0.45, 0.27];
const BLADE_OPS   = [[0.24,0.19],[0.28,0.22],[0.32,0.26],[0.38,0.30],[0.44,0.36],[0.52,0.44]];
const SPEED_PCT   = [17, 33, 50, 67, 83, 100];
const BAR_H       = [[4],[4,7],[4,7,9],[4,7,9,11],[4,7,9,11,13],[4,7,9,11,13,15]];

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
    this._speedNames = Array.isArray(config.speed_names)
      ? config.speed_names
      : DEFAULT_SPEED_NAMES;
    if (this._built) { this._built = false; this._build(); this._built = true; }
  }

  get _extra() { return this._config?.extra_entity || null; }

  getCardSize() { return this._extra ? 5 : 4; }

  static getStubConfig() { return { entity: 'fan.my_ceiling_fan' }; }
  static getConfigElement() { return document.createElement('ceiling-fan-card-editor'); }

  _build() {
    const r = this.shadowRoot;
    r.innerHTML = '';

    const style = document.createElement('style');
    style.textContent = CARD_STYLES;
    r.appendChild(style);

    const card = document.createElement('div');
    card.className = 'card-root';

    const btnHtml = this._speedNames.map((lbl, i) => {
      const bars = BAR_H[i].map(h => '<div class="bar" style="height:' + h + 'px"></div>').join('');
      return '<button class="spd-btn" data-idx="' + i + '"><div class="btn-lbl">' + lbl + '</div><div class="bars">' + bars + '</div></button>';
    }).join('');

    card.innerHTML =
      '<div class="header">' +
        '<div><div class="title" id="name">מאוורר תקרה</div></div>' +
        '<div class="btns" id="btns">' +
          '<button class="power-btn" id="power">' +
            '<svg viewBox="0 0 24 24"><path d="M12 2v6M6.3 6.3A8 8 0 1 0 17.7 6.3"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div class="fan-center">' +
        '<div class="fan-glow" id="glow"></div>' +
        '<svg class="fan-svg" viewBox="0 0 104 104">' +
          '<rect x="50" y="0" width="4" height="14" rx="2" fill="rgba(255,255,255,0.1)"/>' +
          '<ellipse cx="52" cy="18" rx="10" ry="5" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.09)" stroke-width="0.8"/>' +
          '<g id="blades">' +
            '<ellipse class="fan-blade" id="b1" cx="52" cy="27" rx="7" ry="26" transform="rotate(0 52 52)" class="fan-blade-init" stroke-width="0.5"/>' +
            '<ellipse class="fan-blade" id="b2" cx="52" cy="27" rx="7" ry="26" transform="rotate(120 52 52)" class="fan-blade-init" stroke-width="0.5"/>' +
            '<ellipse class="fan-blade" id="b3" cx="52" cy="27" rx="7" ry="26" transform="rotate(240 52 52)" class="fan-blade-init" stroke-width="0.5"/>' +
          '</g>' +
          '<circle cx="52" cy="52" r="10" fill="var(--card-background-color, #fff)" stroke="rgba(99,102,241,0.28)" stroke-width="1"/>' +
          '<circle cx="52" cy="52" r="6" fill="url(#hg)" stroke="rgba(99,102,241,0.18)" stroke-width="0.8"/>' +
          '<circle cx="52" cy="52" r="2.8" fill="var(--accent-color, #818cf8)" opacity="0.9"/>' +
          '<defs><radialGradient id="hg" cx="35%" cy="35%">' +
            '<stop offset="0%" stop-color="rgba(155,160,225,0.9)"/>' +
            '<stop offset="100%" stop-color="rgba(75,80,145,0.85)"/>' +
          '</radialGradient></defs>' +
        '</svg>' +
        '<div class="speed-name off" id="spname">כבוי</div>' +
      '</div>' +
      '<div class="controls">' + btnHtml + '</div>';

    r.appendChild(card);

    r.getElementById('power').addEventListener('click', () => this._togglePower());
    r.querySelectorAll('.spd-btn').forEach(b =>
      b.addEventListener('click', () => this._setSpeed(parseInt(b.dataset.idx) + 1))
    );

    this._buildExtraBtn();
  }

  _buildExtraBtn() {
    const r = this.shadowRoot;
    const btns = r.getElementById('btns');
    if (!btns || !this._extra) return;
    if (r.getElementById('extra-btn')) return; // already exists

    const extraBtn = document.createElement('button');
    extraBtn.className = 'extra-btn';
    extraBtn.id = 'extra-btn';

    if (this._extra.icon) {
      const haIcon = document.createElement('ha-icon');
      haIcon.setAttribute('icon', this._extra.icon);
      const iconColor = this._extra.icon_color
        ? 'var(--' + this._extra.icon_color + '-color, ' + this._extra.icon_color + ')'
        : '#fbbf24';
      haIcon.style.setProperty('--mdc-icon-size', '18px');
      haIcon.style.color = iconColor;
      extraBtn.appendChild(haIcon);
    } else {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.style.cssText = 'width:15px;height:15px;fill:none;stroke:#fbbf24;stroke-width:2;stroke-linecap:round;stroke-linejoin:round';
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
    const pct  = obj.attributes.percentage || 0;
    const lvl  = isOn && pct > 0
      ? SPEED_PCT.reduce((best, p, i) =>
          Math.abs(p - pct) < Math.abs(SPEED_PCT[best - 1] - pct) ? i + 1 : best, 1)
      : 0;

    const nameEl = this.shadowRoot.getElementById('name');
    if (nameEl) nameEl.textContent = this._name || obj.attributes.friendly_name || 'מאוורר תקרה';

    if (isOn && lvl > 0) this._startSpin(lvl);
    else if (!isOn && this._isOn) this._startDecelerate();
    this._isOn = isOn;

    this._updateUI(isOn, lvl);
    this._buildExtraBtn(); // ensure btn exists
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
    // Read accent color from HA theme CSS variable
    return getComputedStyle(this).getPropertyValue('--accent-color').trim() || '#6366f1';
  }

  _setBladeColors(idx) {
    const [o1, o2] = BLADE_OPS[idx];
    const r = this.shadowRoot;
    const accent = this._getAccentColor();
    // Use currentColor trick — set fill as color-mix via style attribute
    const f1 = 'color-mix(in srgb, ' + accent + ' ' + Math.round(o1 * 100) + '%, transparent)';
    const f2 = 'color-mix(in srgb, ' + accent + ' ' + Math.round(o2 * 100) + '%, transparent)';
    r.getElementById('b1')?.setAttribute('fill', f1);
    r.getElementById('b1')?.setAttribute('stroke', f1);
    r.getElementById('b2')?.setAttribute('fill', f2);
    r.getElementById('b2')?.setAttribute('stroke', f2);
    r.getElementById('b3')?.setAttribute('fill', f1);
    r.getElementById('b3')?.setAttribute('stroke', f1);
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

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    // Forward hass to all sub-elements
    this.shadowRoot.querySelectorAll('ha-entity-picker, ha-icon-picker, ha-form, hui-action-editor')
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

    // ── Main entity & name via ha-form ──
    const mainForm = document.createElement('ha-form');
    mainForm.hass   = this._hass;
    mainForm.schema = [
      { name: 'entity', required: true, selector: { entity: { domain: 'fan' } } },
      { name: 'name',   selector: { text: {} } },
    ];
    mainForm.data = {
      entity: this._config.entity || '',
      name:   this._config.name   || '',
    };
    mainForm.computeLabel = s => ({ entity: 'ישות מאוורר', name: 'שם מותאם' })[s.name] || s.name;
    mainForm.addEventListener('value-changed', e => {
      this._config = { ...this._config, ...e.detail.value };
      this._fire();
    });
    root.appendChild(mainForm);

    // ── Speed names via ha-form ──
    const speedTitle = document.createElement('div');
    speedTitle.className = 'section-title';
    speedTitle.textContent = 'שמות מהירויות';
    root.appendChild(speedTitle);

    const names = Array.isArray(this._config.speed_names)
      ? this._config.speed_names
      : DEFAULT_SPEED_NAMES;

    const speedForm = document.createElement('ha-form');
    speedForm.hass   = this._hass;
    speedForm.schema = names.map((_, i) => ({
      name: 'speed_' + (i+1), selector: { text: {} },
    }));
    speedForm.data = Object.fromEntries(names.map((n, i) => ['speed_' + (i+1), n]));
    speedForm.computeLabel = s => 'מהירות ' + s.name.replace('speed_', '');
    speedForm.addEventListener('value-changed', e => {
      const updated = names.map((_, i) => e.detail.value['speed_' + (i+1)] || DEFAULT_SPEED_NAMES[i]);
      this._config = { ...this._config, speed_names: updated };
      this._fire();
    });
    root.appendChild(speedForm);

    // ── Extra entity ──
    const extraTitle = document.createElement('div');
    extraTitle.className = 'section-title';
    extraTitle.textContent = 'ישות נוספת';
    root.appendChild(extraTitle);

    const extra = this._config.extra_entity || null;

    // Toggle switch for extra entity
    const extraToggle = document.createElement('ha-formfield');
    extraToggle.innerHTML = '<ha-switch id="extra-sw"' + (extra ? ' checked' : '') + '></ha-switch><span style="margin-right:8px;font-size:14px;color:var(--primary-text-color)">הוסף ישות לכרטיס</span>';
    extraToggle.style.cssText = 'display:flex;align-items:center;flex-direction:row-reverse;justify-content:flex-end;gap:8px;margin-bottom:8px';
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

      // Entity + name + icon + color via ha-form
      const extraForm = document.createElement('ha-form');
      extraForm.hass   = this._hass;
      extraForm.schema = [
        { name: 'entity',     required: true, selector: { entity: {} } },
        { name: 'name',       selector: { text: {} } },
        { name: 'icon',       selector: { icon: {} } },
        { name: 'icon_color', selector: { ui_color: {} } },
      ];
      extraForm.data = {
        entity:     extra.entity     || '',
        name:       extra.name       || '',
        icon:       extra.icon       || '',
        icon_color: extra.icon_color || '',
      };
      extraForm.computeLabel = s => ({
        entity:     'ישות',
        name:       'שם תווית',
        icon:       'אייקון',
        icon_color: 'צבע אייקון',
      })[s.name] || s.name;
      extraForm.addEventListener('value-changed', e => {
        this._config = {
          ...this._config,
          extra_entity: { ...this._config.extra_entity, ...e.detail.value },
        };
        this._fire();
      });
      extraBlock.appendChild(extraForm);

      // tap_action via hui-action-editor (native HA Interactions UI)
      const actionTitle = document.createElement('div');
      actionTitle.className = 'section-title';
      actionTitle.textContent = 'אינטראקציה';
      actionTitle.style.marginTop = '12px';
      extraBlock.appendChild(actionTitle);

      const actionEditor = document.createElement('hui-action-editor');
      actionEditor.hass   = this._hass;
      actionEditor.label  = 'התנהגות בהקשה';
      actionEditor.config = extra.tap_action || { action: 'more-info' };
      actionEditor.actions = [
        'more-info', 'toggle', 'navigate', 'url',
        'perform-action', 'assist', 'none',
      ];
      actionEditor.addEventListener('value-changed', e => {
        this._config = {
          ...this._config,
          extra_entity: { ...this._config.extra_entity, tap_action: e.detail.value },
        };
        this._fire();
      });
      extraBlock.appendChild(actionEditor);

      root.appendChild(extraBlock);
    }

    r.appendChild(root);

    // Forward hass to all elements
    if (this._hass) {
      r.querySelectorAll('ha-form, ha-entity-picker, ha-icon-picker, hui-action-editor')
        .forEach(el => { el.hass = this._hass; });
    }
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
