# TOG Rating Card

TOG Rating Card is a Home Assistant Lovelace dashboard card for displaying current and forecast child clothing guidance from the TOG Rating integration.

## Companion repositories

- Integration: https://github.com/Anton2079/tog-rating

## Screenshot

![TOG Rating current and forecast cards](assets/tog-rating-screenshot.png)

![TOG Rating entities and device view](assets/tog-rating-screenshot-2.png)

## HACS repository type

Add this repository to HACS as a `Dashboard` repository.

## Recommended GitHub repository settings

- Repository name: `lovelace-tog-rating-card`
- Description: `Home Assistant Lovelace card for current and forecast TOG clothing guidance.`
- Topics: `home-assistant`, `hacs`, `lovelace`, `lovelace-card`, `dashboard`, `tog`

## Repository structure

This repo is intentionally minimal for HACS plugin compatibility:

- `dist/tog-rating-card.js`
- `hacs.json`
- HACS validation workflow

Because the repository name should start with `lovelace-`, HACS accepts `dist/tog-rating-card.js` as the installable file.

## Installation

1. In HACS, add this repository as a custom repository.
2. Choose repository type `Dashboard`.
3. Install `TOG Rating Card`.
4. Make sure the companion integration is installed from:
   - https://github.com/Anton2079/tog-rating
5. Add one of these card types to Lovelace:
   - `custom:tog-rating-current-card`
   - `custom:tog-rating-forecast-card`
   - `custom:tog-rating-card`

## Example cards

Current card:

```yaml
type: custom:tog-rating-current-card
title: Nursery TOG
current_tog_entity: sensor.child_tog_current_tog
current_recommendation_entity: sensor.child_tog_current_recommendation
```

Forecast card:

```yaml
type: custom:tog-rating-forecast-card
title: Nursery Forecast
day_tog_entity: sensor.child_tog_day_tog
day_recommendation_entity: sensor.child_tog_day_recommendation
night_tog_entity: sensor.child_tog_night_tog
night_recommendation_entity: sensor.child_tog_night_recommendation
```

Combined card:

```yaml
type: custom:tog-rating-card
title: Nursery TOG
current_tog_entity: sensor.child_tog_current_tog
current_recommendation_entity: sensor.child_tog_current_recommendation
day_tog_entity: sensor.child_tog_day_tog
day_recommendation_entity: sensor.child_tog_day_recommendation
night_tog_entity: sensor.child_tog_night_tog
night_recommendation_entity: sensor.child_tog_night_recommendation
```