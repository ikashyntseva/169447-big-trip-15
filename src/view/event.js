import EventOffersListView from './event-offers-list';
import { renderNestedElement, createElement, getDuration, humanizeEventStartDate, createPriceTemplate } from '../utils';
import { RenderPosition } from '../enums';

const createEventTemplate = (event) => {
  const { type, destination, startDate, endDate, price, isFavorite } =
  event;
  const startTime = startDate.format('HH:MM');
  const endTime = endDate.format('HH:MM');
  const duration = getDuration(startDate, endDate);
  const favoriteClassName = isFavorite
    ? 'event__favorite-btn event__favorite-btn--active'
    : 'event__favorite-btn';
  const humanizedEventStartDate = humanizeEventStartDate(startDate);

  return `<div class="event">
                <time class="event__date" datetime=${startDate.format()}>${humanizedEventStartDate}</time>
                <div class="event__type">
                  <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
                </div>
                <h3 class="event__title">${type} ${destination}</h3>
                <div class="event__schedule">
                  <p class="event__time">
                    <time class="event__start-time" datetime=${startDate.format()}>${startTime}</time>
                    —
                    <time class="event__end-time" datetime=${endDate.format()}>${endTime}</time>
                  </p>
                  <p class="event__duration">${duration}</p>
                </div>
                <p class="event__price">
                  ${createPriceTemplate('event__price', price)}
                </p>
                <h4 class="visually-hidden">Offers:</h4>
                <button class="${favoriteClassName}" type="button">
                  <span class="visually-hidden">Add to favorite</span>
                  <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
                    <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"></path>
                  </svg>
                </button>
                <button class="event__rollup-btn" type="button">
                  <span class="visually-hidden">Open event</span>
                </button>
              </div>`;
};

class EventView {
  constructor(event) {
    this._event = event;
    this._element = null;
  }

  getTemplate() {
    return createEventTemplate(this._event);
  }

  getElement() {
    if (!this._element) {
      const { offers } = this._event;

      this._element = createElement(this.getTemplate());
      renderNestedElement(this._element.querySelector('button.event__favorite-btn'), new EventOffersListView(offers).getElement(), RenderPosition.BEFOREBEGIN);
    }

    return this._element;
  }

  removeElement() {
    this._element = null;
  }
}
export default EventView;
