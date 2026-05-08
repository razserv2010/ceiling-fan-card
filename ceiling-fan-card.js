/* ══ Editor ══ */
const EDITOR_STYLES = `
  :host { display: block; }
  .root { padding: 4px 0; }
  ha-form { display: block; }
  .section-title {
    font-size: 12px;
    font-weight: 700;
    color: var(--secondary-text-color);
    margin: 20px 0 8px;
  }
  .entity-block {
    border: 1px solid var(--divider-color);
    border-radius: 12px;
    padding: 12px;
    margin-bottom: 10px;
    background: var(--card-background-color);
  }
  .entity-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 8px;
  }
  .entity-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--primary-text-color);
  }
  .delete-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--secondary-text-color);
    padding: 4px;
  }
  .add-btn {
    width: 100%;
    margin-top: 8px;
  }
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
    this.shadowRoot.querySelectorAll('ha-form').forEach((el) => {
      el.hass = hass;
    });
  }

  _fire() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
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

    const mainForm = document.createElement('ha-form');
    mainForm.hass = this._hass;
    mainForm.schema = [
      { name: 'entity', required: true, selector: { entity: { domain: 'fan' } } },
      { name: 'name', selector: { text: {} } },
    ];
    mainForm.data = {
      entity: this._config.entity || '',
      name: this._config.name || '',
    };
    mainForm.computeLabel = (s) => ({
      entity: 'מאוורר',
      name: 'שם לתצוגה',
    })[s.name] || s.name;

    mainForm.addEventListener('value-changed', (e) => {
      this._config = { ...this._config, ...e.detail.value };
      if (!this._config.name) delete this._config.name;
      this._fire();
    });

    root.appendChild(mainForm);

    this._addSection(root, 'שמות מהירויות');

    const names = Array.isArray(this._config.speed_names)
      ? this._config.speed_names
      : DEFAULT_SPEED_NAMES;

    const speedForm = document.createElement('ha-form');
    speedForm.hass = this._hass;
    speedForm.schema = DEFAULT_SPEED_NAMES.map((_, i) => ({
      name: `speed_${i + 1}`,
      selector: { text: {} },
    }));
    speedForm.data = Object.fromEntries(
      DEFAULT_SPEED_NAMES.map((_, i) => [`speed_${i + 1}`, names[i] || DEFAULT_SPEED_NAMES[i]])
    );
    speedForm.computeLabel = (s) => `מהירות ${s.name.replace('speed_', '')}`;

    speedForm.addEventListener('value-changed', (e) => {
      this._config = {
        ...this._config,
        speed_names: DEFAULT_SPEED_NAMES.map((_, i) =>
          e.detail.value[`speed_${i + 1}`] || DEFAULT_SPEED_NAMES[i]
        ),
      };
      this._fire();
    });

    root.appendChild(speedForm);

    this._addSection(root, 'כפתור נוסף בראש הכרטיס');

    const extraForm = document.createElement('ha-form');
    extraForm.hass = this._hass;
    extraForm.schema = [
      { name: 'enabled', selector: { boolean: {} } },
      { name: 'entity', selector: { entity: {} } },
      { name: 'name', selector: { text: {} } },
      { name: 'icon', selector: { icon: {} } },
      { name: 'icon_color', selector: { text: {} } },
    ];

    extraForm.data = {
      enabled: !!this._config.extra_entity,
      entity: this._config.extra_entity?.entity || '',
      name: this._config.extra_entity?.name || '',
      icon: this._config.extra_entity?.icon || '',
      icon_color: this._config.extra_entity?.icon_color || '',
    };

    extraForm.computeLabel = (s) => ({
      enabled: 'הפעל כפתור נוסף',
      entity: 'ישות',
      name: 'שם',
      icon: 'אייקון',
      icon_color: 'צבע אייקון',
    })[s.name] || s.name;

    extraForm.addEventListener('value-changed', (e) => {
      const v = e.detail.value;

      if (!v.enabled) {
        const { extra_entity, ...rest } = this._config;
        this._config = rest;
      } else {
        this._config = {
          ...this._config,
          extra_entity: {
            entity: v.entity || '',
            ...(v.name ? { name: v.name } : {}),
            ...(v.icon ? { icon: v.icon } : {}),
            ...(v.icon_color ? { icon_color: v.icon_color } : {}),
            ...(this._config.extra_entity?.tap_action
              ? { tap_action: this._config.extra_entity.tap_action }
              : {}),
          },
        };
      }

      this._fire();
    });

    root.appendChild(extraForm);

    this._addSection(root, 'ישויות נוספות בכרטיס');

    const entities = this._config.entities || [];
    entities.forEach((cfg, index) => {
      root.appendChild(this._buildEntityBlock(cfg, index));
    });

    const addButton = document.createElement('mwc-button');
    addButton.className = 'add-btn';
    addButton.setAttribute('outlined', '');
    addButton.innerHTML = `
      <ha-icon icon="mdi:plus"></ha-icon>
      הוסף ישות
    `;
    addButton.addEventListener('click', () => {
      this._config = {
        ...this._config,
        entities: [...(this._config.entities || []), { entity: '' }],
      };
      this._fire();
      this._render();
    });

    root.appendChild(addButton);
    r.appendChild(root);
  }

  _addSection(root, title) {
    const el = document.createElement('div');
    el.className = 'section-title';
    el.textContent = title;
    root.appendChild(el);
  }

  _buildEntityBlock(cfg, index) {
    const block = document.createElement('div');
    block.className = 'entity-block';

    const header = document.createElement('div');
    header.className = 'entity-header';

    const title = document.createElement('div');
    title.className = 'entity-title';
    title.textContent = `ישות ${index + 1}`;

    const del = document.createElement('button');
    del.className = 'delete-btn';
    del.innerHTML = '<ha-icon icon="mdi:delete"></ha-icon>';
    del.addEventListener('click', () => {
      const updated = [...(this._config.entities || [])];
      updated.splice(index, 1);
      this._config = { ...this._config, entities: updated };
      if (this._config.entities.length === 0) delete this._config.entities;
      this._fire();
      this._render();
    });

    header.appendChild(title);
    header.appendChild(del);
    block.appendChild(header);

    const form = document.createElement('ha-form');
    form.hass = this._hass;
    form.schema = [
      { name: 'entity', required: true, selector: { entity: {} } },
      { name: 'name', selector: { text: {} } },
      { name: 'icon', selector: { icon: {} } },
    ];

    form.data = {
      entity: cfg.entity || '',
      name: cfg.name || '',
      icon: cfg.icon || '',
    };

    form.computeLabel = (s) => ({
      entity: 'ישות',
      name: 'שם לתצוגה',
      icon: 'אייקון',
    })[s.name] || s.name;

    form.addEventListener('value-changed', (e) => {
      const updated = [...(this._config.entities || [])];

      updated[index] = {
        entity: e.detail.value.entity || '',
        ...(e.detail.value.name ? { name: e.detail.value.name } : {}),
        ...(e.detail.value.icon ? { icon: e.detail.value.icon } : {}),
        ...(updated[index]?.tap_action ? { tap_action: updated[index].tap_action } : {}),
      };

      this._config = { ...this._config, entities: updated };
      this._fire();
    });

    block.appendChild(form);
    return block;
  }
}
