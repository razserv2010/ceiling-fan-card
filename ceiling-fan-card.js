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
 *   name: מאוורר סלון       # optional
 *   speed_count: 6           # optional, default 6
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
  .speed-num { font-family: 'Bebas Neue', sans-serif; font-size: 60px; line-height: 1; color: #38bdf8; letter-spacing: -2px; text-shadow: 0 0 24px rgba(56,189,248,0.45); transition: all .3s; }
  .speed-num.off { color: rgba(255,255,255,0.15); text-shadow: none; }
  .speed-label { font-size: 10px; letter-spacing: 4px; color: rgba(255,255,255,0.25); text-transform: uppercase; margin-top: -4px; }

  .controls { display: flex; gap: 6px; margin-bottom: 20px; justify-content: center; }

  .spd-btn {
    flex: 1; aspect-ratio: 1; max-width: 50px;
    border-radius: 10px; border: 1.5px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
    cursor: pointer; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 3px;
    transition: all .2s; color: white; position: relative; overflow: hidden;
  }
  .spd-btn::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 0; background: linear-gradient(to top, rgba(56,189,248,0.2), transparent); transition: height .25s; }
  .spd-btn:hover { border-color: rgba(56,189,248,0.3); transform: translateY(-2px); }
  .spd-btn:hover::after { height: 100%; }
  .spd-btn.active { border-color: rgba(56,189,248,0.6); background: rgba(56,189,248,0.1); box-shadow: 0 0 14px rgba(56,189,248,0.15), inset 0 1px 0 rgba(56,189,248,0.2); }
  .spd-btn.active::after { height: 100%; }

  .btn-num { font-family: 'Bebas Neue', sans-serif; font-size: 16px; color: rgba(255,255,255,0.3); line-height: 1; transition: color .2s; position: relative; z-index: 1; }
  .spd-btn.active .btn-num { color: #38bdf8; }
  .bars { display: flex; gap: 1.5px; align-items: flex-end; height: 9px; position: relative; z-index: 1; }
  .bar { width: 3px; border-radius: 2px; background: rgba(255,255,255,0.15); transition: background .2s; }
  .spd-btn.active .bar { background: #38bdf8; }

  .stats { display: flex; justify-content: space-between; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.06); }
  .stat { text-align: center; flex: 1; }
  .stat-val { font-family: 'Bebas Neue', sans-serif; font-size: 20px; color: rgba(255,255,255,0.6); transition: color .3s; }
  .stat-val.active { color: #38bdf8; }
  .stat-key { font-size: 9px; letter-spacing: 2px; color: rgba(255,255,255,0.2); text-transform: uppercase; margin-top: 1px; }
  .divider { width: 1px; background: rgba(255,255,255,0.06); align-self: stretch; }
`;

const SPEED_META = [
  { label: 'שקט',     rpm: 180,  watt: 12, flow: 14 },
  { label: 'נמוך',    rpm: 310,  watt: 22, flow: 26 },
  { label: 'בינוני',  rpm: 450,  watt: 35, flow: 40 },
  { label: 'גבוה',    rpm: 600,  watt: 50, flow: 56 },
  { label: 'מהיר',   rpm: 780,  watt: 68, flow: 74 },
  { label: 'מקסימום', rpm: 980, watt: 85, flow: 96 },
];

const SPIN_DURATIONS = [3, 1.8, 1.1, 0.7, 0.45, 0.28];
const BAR_HEIGHTS    = [3, 5, 7, 9, 11, 13];

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
    this._config = config;
    this._entity  = config.entity;
    this._name    = config.name    || null;
    this._count   = config.speed_count || 6;
  }

  getCardSize() { return 5; }

  /* ─── Build DOM ─── */
  _build() {
    const r = this.shadowRoot;
    r.innerHTML = '';
    const style = document.createElement('style');
    style.textContent = STYLES;
    r.appendChild(style);

    const card = document.createElement('ha-card');

    const btnHtml = SPEED_META.slice(0, this._count).map((_, i) => {
      const bars = [0,1,2].map(b =>
        `<div class="bar" style="height:${BAR_HEIGHTS[Math.min(i,2)+b]}px"></div>`
      ).join('');
      return `<button class="spd-btn" data-idx="${i}">
        <div class="btn-num">${i+1}</div>
        <div class="bars">${bars}</div>
      </button>`;
    }).join('');

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
        <div class="speed-num off" id="num">0</div>
        <div class="speed-label">מהירות</div>
      </div>

      <div class="controls">${btnHtml}</div>

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
  }

  /* ─── Sync from HA state ─── */
  _sync() {
    const obj = this._hass?.states[this._entity];
    if (!obj) return;

    const isOn = obj.state === 'on';
    const pct  = obj.attributes.percentage || 0;
    const lvl  = isOn ? Math.max(1, Math.round((pct / 100) * this._count)) : 0;

    const nameEl = this.shadowRoot.getElementById('name');
    if (nameEl) nameEl.textContent = this._name || obj.attributes.friendly_name || 'מאוורר תקרה';

    this._render(isOn, lvl);
  }

  /* ─── Render visuals ─── */
  _render(isOn, lvl) {
    const $ = id => this.shadowRoot.getElementById(id);
    const $$ = sel => this.shadowRoot.querySelectorAll(sel);

    $('power').classList.toggle('on', isOn);
    $('badge').textContent = isOn ? 'פועל' : 'כבוי';
    $('badge').classList.toggle('on', isOn);
    $('glow').classList.toggle('active', isOn && lvl > 0);

    // Spin
    const blades = $('blades');
    blades.style.animation = isOn && lvl > 0
      ? `spin ${SPIN_DURATIONS[lvl-1]}s linear infinite`
      : 'none';

    // Blade tint
    const ops = [0.08,0.12,0.18,0.24,0.32,0.42];
    $$('.fan-blade').forEach(b => {
      b.style.fill = isOn && lvl > 0
        ? `rgba(56,189,248,${ops[lvl-1]})`
        : 'rgba(255,255,255,0.07)';
    });

    // Number
    $('num').textContent = isOn && lvl > 0 ? lvl : '0';
    $('num').classList.toggle('off', !isOn || lvl === 0);

    // Buttons
    $$('.spd-btn').forEach(b =>
      b.classList.toggle('active', isOn && parseInt(b.dataset.idx) === lvl - 1)
    );

    // Stats
    const m = isOn && lvl > 0 ? SPEED_META[lvl-1] : null;
    this._animateTo($('s-rpm'),  m ? m.rpm  : 0, '');
    this._animateTo($('s-watt'), m ? m.watt : 0, 'W');
    this._animateTo($('s-flow'), m ? m.flow : 0, '');
    [$('s-rpm'), $('s-watt'), $('s-flow')].forEach(el =>
      el.classList.toggle('active', !!m)
    );
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
      percentage: Math.round((n / this._count) * 100),
    });
  }
}

customElements.define('ceiling-fan-card', CeilingFanCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'ceiling-fan-card',
  name:        'Ceiling Fan Card',
  description: 'כרטיס מאוורר תקרה עם 6 מצבי מהירות',
  preview:     true,
});
