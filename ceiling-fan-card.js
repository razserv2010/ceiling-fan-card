const CARD_STYLES = `
  :host {
    display: block;
    font-family: var(--primary-font-family, sans-serif);
  }

  ha-card {
    background: linear-gradient(145deg, #1c2033, #161926);
    border-radius: 28px;
    padding: 24px 22px 20px;
    border: 1px solid rgba(255,255,255,0.07);
    box-shadow: 0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
    position: relative;
    overflow: hidden;
    color: white;
  }

  ha-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    border-radius: 28px 28px 0 0;
    background: linear-gradient(90deg, #6366f1, #0ea5e9, #06b6d4);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 14px;
  }

  .title {
    font-size: 15px;
    font-weight: 800;
    color: #f1f5f9;
    line-height: 1;
  }

  .btns {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  button {
    -webkit-tap-highlight-color: transparent;
  }

  .power-btn,
  .extra-btn {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .power-btn {
    border: 1.5px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.05);
    transition: all .35s;
  }

  .power-btn.on {
    border-color: rgba(99,102,241,0.6);
    box-shadow: 0 0 12px rgba(99,102,241,0.3);
  }

  .power-btn svg {
    width: 14px;
    height: 14px;
    stroke: rgba(255,255,255,0.3);
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    transition: stroke .3s;
  }

  .power-btn.on svg {
    stroke: #818cf8;
  }

  .extra-btn {
    border: 1.5px solid rgba(251,191,36,0.4);
    background: rgba(251,191,36,0.08);
    box-shadow: 0 0 10px rgba(251,191,36,0.15);
  }

  .extra-btn ha-icon {
    --mdc-icon-size: 18px;
    color: #fbbf24;
  }

  .fan-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    position: relative;
    margin-bottom: 14px;
  }

  .fan-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -54%);
    width: 130px;
    height: 130px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,0.15), transparent 65%);
    opacity: 0;
    transition: opacity .5s;
    pointer-events: none;
  }

  .fan-glow.active {
    opacity: 1;
  }

  .fan-svg {
    width: 120px;
    height: 120px;
    overflow: visible;
  }

  .speed-name {
    font-size: 20px;
    font-weight: 800;
    color: #818cf8;
    text-shadow: 0 0 14px rgba(99,102,241,0.35);
  }

  .speed-name.off {
    color: rgba(255,255,255,0.18);
    text-shadow: none;
  }

  .controls {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 5px;
  }

  .spd-btn {
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.03);
    cursor: pointer;
    padding: 7px 2px 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    transition: all .2s;
  }

  .spd-btn.active {
    border-color: rgba(99,102,241,0.5);
    background: rgba(99,102,241,0.12);
    box-shadow: 0 0 10px rgba(99,102,241,0.12);
  }

  .btn-lbl {
    font-size: 9px;
    font-weight: 700;
    color: rgba(255,255,255,0.32);
    line-height: 1.15;
    text-align: center;
    direction: rtl;
  }

  .spd-btn.active .btn-lbl {
    color: #a5b4fc;
  }

  .bars {
    display: flex;
    gap: 1.5px;
    align-items: flex-end;
    height: 15px;
  }

  .bar {
    width: 3px;
    border-radius: 2px;
    background: rgba(255,255,255,0.1);
  }

  .spd-btn.active .bar {
    background: #818cf8;
  }
`;

const DEFAULT_SPEED_NAMES = ['חלש מאוד', 'חלש', 'בינוני-חלש', 'בינוני', 'חזק', 'חזק מאוד'];
const TARGET_DURS = [3.5, 2.0, 1.2, 0.75, 0.45, 0.27];
const SPEED_PCT = [17, 33, 50, 67, 83, 100];
const BAR_H = [[4], [4,7], [4,7,9], [4,7,9,11], [4,7,9,11,13], [4,7,9,11,13,15]];

class CeilingFanCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._built = false;
    this._angle = 0;
    this._currentDur = TARGET_DURS[2];
    this._rafId = null;
    this._lastTs = null;
    this._decelerating = false;
    this._wasOn = false;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('חובה להגדיר entity');
    }

    this._config = config;
    this._entity = config.entity;
    this._name = config.name || null;
    this._speedNames = config.speed_names || DEFAULT_SPEED_NAMES;

    this._build();
  }

  set hass(hass) {
    this._hass = hass;

    if (!this._built) {
      this._build();
    }

    this._sync();
  }

  getCardSize() {
    return 4;
  }

  _build() {
    if (!this._config || !this._config.entity) return;

    const root = this.shadowRoot;
    root.innerHTML = '';

    const style = document.createElement('style');
    style.textContent = CARD_STYLES;
    root.appendChild(style);

    const card = document.createElement('ha-card');

    const speedButtons = this._speedNames.map((label, index) => {
      const bars = BAR_H[index]
        .map((height) => `<div class="bar" style="height:${height}px"></div>`)
        .join('');

      return `
        <button class="spd-btn" data-idx="${index}">
          <div class="btn-lbl">${label}</div>
          <div class="bars">${bars}</div>
        </button>
      `;
    }).join('');

    card.innerHTML = `
      <div class="header">
        <div>
          <div class="title" id="name">מאוורר תקרה</div>
        </div>

        <div class="btns" id="btns">
          ${this._config.extra_entity ? `
            <button class="extra-btn" id="extra-btn">
              <ha-icon icon="${this._config.extra_entity.icon || 'mdi:timer-outline'}"></ha-icon>
            </button>
          ` : ''}

          <button class="power-btn" id="power">
            <svg viewBox="0 0 24 24">
              <path d="M12 2v6M6.3 6.3A8 8 0 1 0 17.7 6.3"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="fan-center">
        <div class="fan-glow" id="glow"></div>

        <svg class="fan-svg" viewBox="0 0 104 104">
          <rect x="50" y="0" width="4" height="14" rx="2" fill="rgba(255,255,255,0.1)"/>
          <ellipse cx="52" cy="18" rx="10" ry="5" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.09)" stroke-width="0.8"/>

          <g id="blades">
            <ellipse id="b1" cx="52" cy="27" rx="7" ry="26" transform="rotate(0 52 52)" fill="rgba(99,102,241,0.24)" stroke="rgba(99,102,241,0.32)" stroke-width="0.5"/>
            <ellipse id="b2" cx="52" cy="27" rx="7" ry="26" transform="rotate(120 52 52)" fill="rgba(99,102,241,0.19)" stroke="rgba(99,102,241,0.26)" stroke-width="0.5"/>
            <ellipse id="b3" cx="52" cy="27" rx="7" ry="26" transform="rotate(240 52 52)" fill="rgba(99,102,241,0.24)" stroke="rgba(99,102,241,0.32)" stroke-width="0.5"/>
          </g>

          <circle cx="52" cy="52" r="10" fill="#1a1d2e" stroke="rgba(99,102,241,0.28)" stroke-width="1"/>
          <circle cx="52" cy="52" r="6" fill="#4b5091" stroke="rgba(99,102,241,0.18)" stroke-width="0.8"/>
          <circle cx="52" cy="52" r="2.8" fill="#818cf8" opacity="0.9"/>
        </svg>

        <div class="speed-name off" id="spname">כבוי</div>
      </div>

      <div class="controls">
        ${speedButtons}
      </div>
    `;

    root.appendChild(card);

    root.getElementById('power').addEventListener('click', () => this._togglePower());

    const extraBtn = root.getElementById('extra-btn');
    if (extraBtn) {
      extraBtn.addEventListener('click', () => this._handleExtraTap());
    }

    root.querySelectorAll('.spd-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const index = Number(btn.dataset.idx);
        this._setSpeed(index + 1);
      });
    });

    this._built = true;
  }

  _sync() {
    if (!this._hass || !this._entity) return;

    const stateObj = this._hass.states[this._entity];
    if (!stateObj) return;

    const isOn = stateObj.state === 'on';
    const pct = Number(stateObj.attributes.percentage || 0);

    let level = 0;

    if (isOn && pct > 0) {
      level = this._nearestLevel(pct);
    }

    const nameEl = this.shadowRoot.getElementById('name');
    if (nameEl) {
      nameEl.textContent = this._name || stateObj.attributes.friendly_name || 'מאוורר תקרה';
    }

    if (isOn && level > 0) {
      this._startSpin(level);
    } else if (!isOn && this._wasOn) {
      this._startDecelerate();
    }

    this._wasOn = isOn;
    this._updateUI(isOn, level);
  }

  _nearestLevel(pct) {
    let bestIndex = 0;
    let bestDiff = Math.abs(SPEED_PCT[0] - pct);

    SPEED_PCT.forEach((value, index) => {
      const diff = Math.abs(value - pct);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestIndex = index;
      }
    });

    return bestIndex + 1;
  }

  _updateUI(isOn, level) {
    const root = this.shadowRoot;

    const power = root.getElementById('power');
    const glow = root.getElementById('glow');
    const spname = root.getElementById('spname');

    if (power) {
      power.classList.toggle('on', isOn);
    }

    if (glow) {
      glow.classList.toggle('active', isOn && level > 0);
    }

    if (spname) {
      if (isOn && level > 0) {
        spname.textContent = this._speedNames[level - 1] || '';
        spname.classList.remove('off');
      } else if (!this._decelerating) {
        spname.textContent = 'כבוי';
        spname.classList.add('off');
      }
    }

    root.querySelectorAll('.spd-btn').forEach((btn) => {
      const index = Number(btn.dataset.idx);
      btn.classList.toggle('active', isOn && index === level - 1);
    });
  }

  _startSpin(level) {
    this._decelerating = false;
    this._currentDur = TARGET_DURS[level - 1];

    if (!this._rafId) {
      this._lastTs = null;
      this._rafId = requestAnimationFrame((ts) => this._loop(ts));
    }
  }

  _startDecelerate() {
    this._decelerating = true;

    if (!this._rafId) {
      this._lastTs = null;
      this._rafId = requestAnimationFrame((ts) => this._loop(ts));
    }
  }

  _loop(ts) {
    if (!this._lastTs) {
      this._lastTs = ts;
    }

    const dt = Math.min((ts - this._lastTs) / 1000, 0.05);
    this._lastTs = ts;

    if (this._decelerating) {
      this._currentDur += dt * 5;

      if (this._currentDur >= 20) {
        this._decelerating = false;
        this._rafId = null;
        this._lastTs = null;

        const spname = this.shadowRoot.getElementById('spname');
        if (spname) {
          spname.textContent = 'כבוי';
          spname.classList.add('off');
        }

        return;
      }
    }

    this._angle = (this._angle + 360 / this._currentDur * dt) % 360;

    const blades = this.shadowRoot.getElementById('blades');
    if (blades) {
      blades.setAttribute('transform', `rotate(${this._angle} 52 52)`);
    }

    this._rafId = requestAnimationFrame((nextTs) => this._loop(nextTs));
  }

  _togglePower() {
    if (!this._hass || !this._entity) return;

    const isOn = this._hass.states[this._entity]?.state === 'on';

    this._hass.callService('fan', isOn ? 'turn_off' : 'turn_on', {
      entity_id: this._entity,
    });
  }

  _setSpeed(level) {
    if (!this._hass || !this._entity) return;

    this._hass.callService('fan', 'turn_on', {
      entity_id: this._entity,
      percentage: SPEED_PCT[level - 1],
    });
  }

  _handleExtraTap() {
    if (!this._hass || !this._config.extra_entity) return;

    const extra = this._config.extra_entity;
    const actionConfig = extra.tap_action || { action: 'toggle' };

    if (actionConfig.action === 'toggle') {
      const domain = extra.entity.split('.')[0];
      this._hass.callService(domain, 'toggle', {
        entity_id: extra.entity,
      });
      return;
    }

    if (actionConfig.action === 'more-info') {
      const event = new CustomEvent('hass-more-info', {
        bubbles: true,
        composed: true,
        detail: {
          entityId: extra.entity,
        },
      });
      this.dispatchEvent(event);
      return;
    }

    if (
      actionConfig.action === 'perform-action' ||
      actionConfig.action === 'perform_action' ||
      actionConfig.action === 'call-service'
    ) {
      const service = actionConfig.perform_action || actionConfig.service;

      if (!service) return;

      const parts = service.split('.');
      if (parts.length !== 2) return;

      const domain = parts[0];
      const serviceName = parts[1];

      const data = actionConfig.data || actionConfig.service_data || {};

      this._hass.callService(domain, serviceName, {
        entity_id: extra.entity,
        ...data,
      });

      return;
    }
  }
}

if (!customElements.get('ceiling-fan-card')) {
  customElements.define('ceiling-fan-card', CeilingFanCard);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'ceiling-fan-card',
  name: 'Ceiling Fan Card',
  description: 'כרטיס מאוורר תקרה',
  preview: true,
});

console.info(
  '%c CEILING-FAN-CARD loaded ',
  'color: white; background: #6366f1; font-weight: bold; padding: 4px 8px; border-radius: 4px;'
);
