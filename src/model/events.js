import dayjs from 'dayjs';
import AbstractObserver from '../utils/abstract-observer';
import { updateItem, addItem, deleteItem } from '../utils/common';

class EventsModel extends AbstractObserver {
  constructor() {
    super();
    this._events = [];
  }

  static adaptToClient(event) {
    const adaptedEvent = Object.assign({},
      event,
      {
        price: event['base_price'],
        startDate: dayjs(event['date_from']),
        endDate: dayjs(event['date_to']),
        isFavorite: event['is_favorite'],
        eventType: event.type,
      },
    );

    delete adaptedEvent['base_price'];
    delete adaptedEvent['date_from'];
    delete adaptedEvent['date_to'];
    delete adaptedEvent['is_favorite'];
    delete adaptedEvent.type;

    return adaptedEvent;
  }

  static adaptToServer(event) {
    const { price, startDate, endDate, isFavorite, eventType } = event;
    const adaptedEvent = Object.assign({},
      event,
      {
        'base_price': price,
        'date_from': startDate,
        'date_to': endDate,
        'is_favorite': isFavorite,
        type: eventType,
      });

    delete adaptedEvent.price;
    delete adaptedEvent.startDate;
    delete adaptedEvent.endDate;
    delete adaptedEvent.isFavorite;
    delete adaptedEvent.eventType;

    return adaptedEvent;
  }

  setEvents(updateType, events) {
    this._events = events.slice();
    this._notify(updateType);
  }

  getEvents() {
    return this._events;
  }

  updateEvent(updateType, updatedEvent) {
    this._events = updateItem(this._events, updatedEvent);
    this._notify(updateType, updatedEvent);
  }

  addEvent(updateType, newEvent) {
    this._events = addItem(this._events, newEvent);
    this._notify(updateType, newEvent);
  }

  deleteEvent(updateType, deletedEvent) {
    this._events = deleteItem(this._events, deletedEvent);
    this._notify(updateType);
  }
}

export default EventsModel;
