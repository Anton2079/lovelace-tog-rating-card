class TogRatingBaseCard extends HTMLElement {
  static getConfigForm() {
    return {
      schema: [
        { name: "title", selector: { text: {} } },
        { name: "current_tog_entity", selector: { entity: { domain: "sensor" } } },
        { name: "current_recommendation_entity", selector: { entity: { domain: "sensor" } } },
        { name: "day_tog_entity", selector: { entity: { domain: "sensor" } } },
        { name: "day_recommendation_entity", selector: { entity: { domain: "sensor" } } },
        { name: "night_tog_entity", selector: { entity: { domain: "sensor" } } },
        { name: "night_recommendation_entity", selector: { entity: { domain: "sensor" } } }
      ]
    };
  }

  static getStubConfig() {
    return {
      title: "TOG Rating",
      current_tog_entity: "sensor.example_current_tog",
      current_recommendation_entity: "sensor.example_current_recommendation",
      day_tog_entity: "sensor.example_day_tog",
      day_recommendation_entity: "sensor.example_day_recommendation",
      night_tog_entity: "sensor.example_night_tog",
      night_recommendation_entity: "sensor.example_night_recommendation"
    };
  }

  setConfig(config) {
    this.config = config;
    if (!this.card) {
      this.card = document.createElement("ha-card");
      this.card.className = "tog-rating-card";
      this.appendChild(this.card);
    }
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  _stateObject(entityId) {
    return entityId ? this._hass?.states?.[entityId] ?? null : null;
  }

  _state(entity, fallback) {
    return entity ? entity.state : fallback;
  }

  _attribute(entity, key, fallback) {
    if (!entity || entity.attributes?.[key] === undefined || entity.attributes?.[key] === null) {
      return fallback;
    }
    return entity.attributes[key];
  }

  _friendlyState(entity) {
    if (!entity) {
      return "Unavailable";
    }
    return entity.state
      .split("_").join(" ")
      .replace(/\b\w/g, (match) => match.toUpperCase());
  }

  _forecastTog(entity, togEntity) {
    if (togEntity) {
      return `${togEntity.state} TOG`;
    }
    const tog = this._attribute(entity, "tog_rating", null);
    return tog === null ? "-" : `${tog} TOG`;
  }

  _renderList(entity) {
    const items = entity?.attributes?.clothing_items;
    if (!Array.isArray(items) || !items.length) {
      return "";
    }
    return `<ul class="tog-list">${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
  }

  _renderInlineFact(label, value) {
    return `
      <div class="tog-inline-fact">
        <span class="tog-inline-label">${label}</span>
        <span class="tog-inline-value">${value}</span>
      </div>
    `;
  }

  _formatForecastTime(value) {
    if (!value) {
      return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit"
    }).format(date);
  }

  _renderForecastPanel(label, entity, togEntity) {
    if (!entity && !togEntity) {
      return `<div class="tog-panel"><div class="tog-overline">${label}</div><div class="tog-subtle">Configure ${label.toLowerCase()} entities.</div></div>`;
    }

    const tempLabel = label.toLowerCase().includes("night") ? "Low" : "High";

    return `
      <div class="tog-panel">
        <div class="tog-overline">${label}</div>
        <div class="tog-score-row">
          <div class="tog-score-main">
            <div class="tog-score-value">${this._forecastTog(entity, togEntity)}</div>
            <div class="tog-headline">${this._friendlyState(entity)}</div>
          </div>
          <div class="tog-inline-facts">
            ${this._renderInlineFact(tempLabel, `${this._attribute(entity, "outdoor_temperature_c", "-")}°C`)}
          </div>
        </div>
        <div class="tog-subtle">${this._attribute(entity, "headline", "Forecast unavailable")}</div>
        <div class="tog-message">${this._attribute(entity, "general_message", "Forecast unavailable")}</div>
        ${this._renderList(entity)}
      </div>
    `;
  }

  _styles() {
    return `
      <style>
        .tog-shell {
          padding: 16px;
          color: var(--primary-text-color);
          background: linear-gradient(
            180deg,
            color-mix(in srgb, var(--card-background-color) 92%, var(--primary-color) 8%),
            var(--card-background-color)
          );
        }

        .tog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }

        .tog-title {
          font-size: 1.15rem;
          font-weight: 700;
        }

        .tog-pill {
          padding: 6px 10px;
          border-radius: 999px;
          background: var(--secondary-background-color, rgba(127, 127, 127, 0.15));
          color: var(--primary-text-color);
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .tog-stack,
        .tog-grid {
          display: grid;
          gap: 12px;
        }

        .tog-grid.forecast {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .tog-panel {
          padding: 16px;
          border-radius: var(--ha-card-border-radius, 16px);
          background: color-mix(in srgb, var(--card-background-color) 88%, var(--primary-background-color) 12%);
          border: 1px solid var(--divider-color);
        }

        .tog-overline {
          margin: 0 0 8px;
          color: var(--secondary-text-color);
          font-size: 0.78rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 700;
        }

        .tog-score-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 10px;
        }

        .tog-score-main {
          display: flex;
          align-items: baseline;
          gap: 10px;
          flex-wrap: wrap;
        }

        .tog-score-value {
          font-size: 2.4rem;
          font-weight: 800;
          line-height: 1;
        }

        .tog-inline-facts {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: flex-end;
        }

        .tog-inline-fact {
          display: inline-flex;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 999px;
          background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
          font-size: 0.86rem;
          color: var(--secondary-text-color);
        }

        .tog-inline-label {
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .tog-inline-value {
          color: var(--primary-text-color);
          font-weight: 700;
        }

        .tog-headline {
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .tog-subtle {
          color: var(--secondary-text-color);
          font-size: 0.95rem;
          line-height: 1.45;
        }

        .tog-summary-row {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 12px;
          color: var(--secondary-text-color);
          font-size: 0.92rem;
        }

        .tog-message {
          margin-top: 12px;
          padding: 12px 14px;
          border-left: 3px solid var(--warning-color, var(--primary-color));
          background: color-mix(in srgb, var(--card-background-color) 86%, var(--warning-color, var(--primary-color)) 14%);
          border-radius: 0 12px 12px 0;
          line-height: 1.5;
        }

        .tog-list {
          margin: 12px 0 0;
          padding-left: 20px;
          line-height: 1.6;
        }

        .tog-list li {
          margin-bottom: 4px;
        }

        @media (max-width: 720px) {
          .tog-grid.forecast {
            grid-template-columns: 1fr;
          }

          .tog-score-row {
            align-items: flex-start;
          }

          .tog-inline-facts {
            justify-content: flex-start;
          }
        }
      </style>
    `;
  }
}

class TogRatingCurrentCard extends TogRatingBaseCard {
  static getStubConfig() {
    return {
      title: "Nursery TOG",
      current_tog_entity: "sensor.example_current_tog",
      current_recommendation_entity: "sensor.example_current_recommendation"
    };
  }

  getCardSize() {
    return 4;
  }

  getGridOptions() {
    return {
      columns: 6,
      rows: 4,
      min_rows: 4
    };
  }

  render() {
    if (!this.card || !this._hass || !this.config) {
      return;
    }

    const currentTog = this._stateObject(this.config.current_tog_entity);
    const currentRecommendation = this._stateObject(this.config.current_recommendation_entity);

    if (!currentTog || !currentRecommendation) {
      this.card.innerHTML = `${this._styles()}<div class="tog-shell"><div class="tog-panel">Configure current TOG and current recommendation entities.</div></div>`;
      return;
    }

    const title = this.config.title || "Current TOG";
    this.card.innerHTML = `
      ${this._styles()}
      <div class="tog-shell">
        <div class="tog-header">
          <div class="tog-title">${title}</div>
          <div class="tog-pill">${this._friendlyState(currentRecommendation)}</div>
        </div>
        <div class="tog-panel">
          <div class="tog-overline">Current recommendation</div>
          <div class="tog-score-row">
            <div class="tog-score-main">
              <div class="tog-score-value">${this._state(currentTog, "-")}</div>
              <div class="tog-headline">${this._attribute(currentRecommendation, "headline", "No recommendation")}</div>
            </div>
            <div class="tog-inline-facts">
              ${this._renderInlineFact("Indoor", `${this._attribute(currentRecommendation, "indoor_temperature_c", "-")}°C`)}
              ${this._renderInlineFact("Outdoor", `${this._attribute(currentRecommendation, "outdoor_temperature_c", "-")}°C`)}
              ${this._renderInlineFact("Effective", `${this._attribute(currentRecommendation, "effective_temperature_c", "-")}°C`)}
            </div>
          </div>
          <div class="tog-subtle">${this._attribute(currentRecommendation, "reasoning", "Waiting for source entities")}</div>
          <div class="tog-message">${this._attribute(currentRecommendation, "general_message", "")}</div>
          ${this._renderList(currentRecommendation)}
          <div class="tog-summary-row">
            <span>Risk: ${this._attribute(currentRecommendation, "risk", "unknown")}</span>
            <span>TOG: ${this._attribute(currentRecommendation, "tog_rating", this._state(currentTog, "-"))}</span>
          </div>
        </div>
      </div>
    `;
  }
}

class TogRatingForecastCard extends TogRatingBaseCard {
  static getStubConfig() {
    return {
      title: "TOG Forecast",
      day_tog_entity: "sensor.example_day_tog",
      day_recommendation_entity: "sensor.example_day_recommendation",
      night_tog_entity: "sensor.example_night_tog",
      night_recommendation_entity: "sensor.example_night_recommendation"
    };
  }

  getCardSize() {
    return 5;
  }

  getGridOptions() {
    return {
      columns: 12,
      rows: 5,
      min_rows: 4
    };
  }

  render() {
    if (!this.card || !this._hass || !this.config) {
      return;
    }

    const dayTog = this._stateObject(this.config.day_tog_entity);
    const dayRecommendation = this._stateObject(this.config.day_recommendation_entity);
    const nightTog = this._stateObject(this.config.night_tog_entity);
    const nightRecommendation = this._stateObject(this.config.night_recommendation_entity);

    this.card.innerHTML = `
      ${this._styles()}
      <div class="tog-shell">
        <div class="tog-header">
          <div class="tog-title">${this.config.title || "TOG Forecast"}</div>
        </div>
        <div class="tog-grid forecast">
          ${this._renderForecastPanel("Day forecast", dayRecommendation, dayTog)}
          ${this._renderForecastPanel("Night forecast", nightRecommendation, nightTog)}
        </div>
      </div>
    `;
  }

}

class TogRatingCard extends TogRatingBaseCard {
  static getStubConfig() {
    return {
      title: "Nursery TOG",
      current_tog_entity: "sensor.example_current_tog",
      current_recommendation_entity: "sensor.example_current_recommendation",
      day_tog_entity: "sensor.example_day_tog",
      day_recommendation_entity: "sensor.example_day_recommendation",
      night_tog_entity: "sensor.example_night_tog",
      night_recommendation_entity: "sensor.example_night_recommendation"
    };
  }

  getCardSize() {
    return 8;
  }

  getGridOptions() {
    return {
      columns: 12,
      rows: 8,
      min_rows: 6
    };
  }

  render() {
    if (!this.card || !this._hass || !this.config) {
      return;
    }

    const currentTog = this._stateObject(this.config.current_tog_entity);
    const currentRecommendation = this._stateObject(this.config.current_recommendation_entity);
    const dayTog = this._stateObject(this.config.day_tog_entity);
    const dayRecommendation = this._stateObject(this.config.day_recommendation_entity);
    const nightTog = this._stateObject(this.config.night_tog_entity);
    const nightRecommendation = this._stateObject(this.config.night_recommendation_entity);

    this.card.innerHTML = `
      ${this._styles()}
      <div class="tog-shell">
        <div class="tog-header">
          <div class="tog-title">${this.config.title || "TOG Rating"}</div>
          <div class="tog-pill">${this._friendlyState(currentRecommendation)}</div>
        </div>
        <div class="tog-stack">
          <div class="tog-panel">
            <div class="tog-overline">Current recommendation</div>
            <div class="tog-score-row">
              <div class="tog-score-main">
                <div class="tog-score-value">${this._state(currentTog, "-")}</div>
                <div class="tog-headline">${this._attribute(currentRecommendation, "headline", "No recommendation")}</div>
              </div>
              <div class="tog-inline-facts">
                ${this._renderInlineFact("Indoor", `${this._attribute(currentRecommendation, "indoor_temperature_c", "-")}°C`)}
                ${this._renderInlineFact("Outdoor", `${this._attribute(currentRecommendation, "outdoor_temperature_c", "-")}°C`)}
                ${this._renderInlineFact("Effective", `${this._attribute(currentRecommendation, "effective_temperature_c", "-")}°C`)}
              </div>
            </div>
            <div class="tog-subtle">${this._attribute(currentRecommendation, "reasoning", "Waiting for source entities")}</div>
            <div class="tog-message">${this._attribute(currentRecommendation, "general_message", "")}</div>
            ${this._renderList(currentRecommendation)}
          </div>
          <div class="tog-grid forecast">
            ${this._renderForecastPanel("Day forecast", dayRecommendation, dayTog)}
            ${this._renderForecastPanel("Night forecast", nightRecommendation, nightTog)}
          </div>
        </div>
      </div>
    `;
  }
}

function registerCard(tagName, cardClass, metadata) {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, cardClass);
  }

  window.customCards = window.customCards || [];
  if (!window.customCards.find((card) => card.type === metadata.type)) {
    window.customCards.push(metadata);
  }
}

registerCard("tog-rating-card", TogRatingCard, {
  type: "custom:tog-rating-card",
  name: "TOG Rating Card",
  description: "Combined current and forecast TOG guidance.",
  preview: true,
  documentationURL: "https://github.com/Anton2079/tog-rating"
});

registerCard("tog-rating-current-card", TogRatingCurrentCard, {
  type: "custom:tog-rating-current-card",
  name: "TOG Current Card",
  description: "Compact current TOG recommendation card.",
  preview: true,
  documentationURL: "https://github.com/Anton2079/tog-rating"
});

registerCard("tog-rating-forecast-card", TogRatingForecastCard, {
  type: "custom:tog-rating-forecast-card",
  name: "TOG Forecast Card",
  description: "Day and night forecast TOG guidance card.",
  preview: true,
  documentationURL: "https://github.com/Anton2079/tog-rating"
});