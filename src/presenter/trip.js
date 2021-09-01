import Event from './event';
import Filters from '../presenter/filters';
import EventsSortView from '../view/events-sort';
import EventsListView from '../view/events-list-section';
import EventsListItemView from '../view/events-list-item';
import AddEventFormView from '../view/event-add';
import NoEventsView from '../view/no-events';
import AddEventButtonView from '../view/add-event-button';
import { Sorting, RenderPosition, UserAction, UpdateType } from '../enums';
import { render, remove, replace } from '../utils/render.js';
import { filterTypeToCallBack } from '../utils/filters';
import { onEscKeyDown, contains, sortTypeToCallBack} from '../utils/common';
import TripInfoView from '../view/trip-info';
import { DEFAULT_SORTING } from '../const';
class Trip {
  constructor(pageContainer, filtersModel, eventsModel) {
    this._eventsModel = eventsModel;
    this._filtersModel = filtersModel;
    this._sortType = Sorting.DAY;

    this._headerElement = pageContainer.querySelector('.page-header .trip-main');
    this._controlsElement = this._headerElement.querySelector('.trip-controls');
    this._tripContainer = pageContainer.querySelector('.trip-events');

    this._tripInfoComponent = null;
    this._eventsSortComponent = null;

    this._eventPresenter = new Map();
    this._eventsListComponent = null;
    this._noEventsComponent = null;
    this._addEventButtonComponent = new AddEventButtonView();


    this._handleEventAdd = this._handleEventAdd.bind(this);
    this._handleViewAction = this._handleViewAction.bind(this);
    this._handleModelEvent = this._handleModelEvent.bind(this);
    this._removeAddEventForm = this._removeAddEventForm.bind(this);
    this._handleModeChange = this._handleModeChange.bind(this);
    this._handleEnterAddMode = this._handleEnterAddMode.bind(this);
    this._handleSortTypeChange = this._handleSortTypeChange.bind(this);
    this._filtersPresenter = null;
    this._eventsModel.addObserver(this._handleModelEvent);
    this._filtersModel.addObserver(this._handleModelEvent);
  }

  init() {
    if (!this._filtersPresenter) {
      this._filtersPresenter = new Filters(this._controlsElement, this._filtersModel, this._eventsModel);
      this._filtersPresenter.init();
    }
    this._renderAddEventButton();
    this._renderTrip();
  }

  destroy() {
    this._clearTrip({ resetSortType: true, disableFilters: true, disableAddBtn: true });
  }

  _getEvents() {
    const filterType = this._filtersModel.getFilter();
    const events = this._eventsModel.getEvents().slice();
    const filteredEvents = filterTypeToCallBack[filterType](events);

    return sortTypeToCallBack[this._sortType](filteredEvents);
  }

  _handleEventAdd(newEvent) {
    this._handleViewAction(
      UserAction.ADD_EVENT,
      UpdateType.MAJOR,
      newEvent,
    );
  }

  _handleViewAction(actionType, updateType, update) {
    switch (actionType) {
      case UserAction.UPDATE_EVENT: {
        this._eventsModel.updateEvent(updateType, update);
        break;
      }
      case UserAction.ADD_EVENT: {
        this._eventsModel.addEvent(updateType, update);
        break;
      }
      case UserAction.DELETE_EVENT: {
        this._eventsModel.deleteEvent(updateType, update);
        break;
      }
    }
  }

  _handleModelEvent(updateType, data) {
    switch (updateType) {
      case UpdateType.PATCH: {
        this._eventPresenter.get(data.id).init(data);
        break;
      }

      case UpdateType.MINOR: {
        this._clearTrip();
        this._renderTrip();
        break;
      }
      case UpdateType.MAJOR: {
        this._clearTrip({resetSortType: true, removeTripInfo: true});
        this._renderTrip();
        break;
      }
    }
  }

  _handleModeChange() {
    this._eventPresenter.forEach((presenter) => presenter.resetView());
  }

  _handleEnterAddMode() {
    if (contains(this._tripContainer, this._noEventsComponent)) {
      replace(this._eventsListComponent, this._noEventsComponent);
    }

    this._renderAddEventForm();
    this._addEventButtonComponent.setDisabled(true);
  }

  _handleSortTypeChange(sortType) {
    if (this._sortType !== sortType) {
      this._sortType = sortType;
      this._clearTrip();
      this._renderTrip();
    }
  }

  _renderAddEventButton() {
    this._addEventButtonComponent.setEnterAddModeHandler(this._handleEnterAddMode);
    render(this._headerElement, this._addEventButtonComponent, RenderPosition.BEFOREEND);
  }

  _renderAddEventForm() {
    this._addEventFormListItemComponent = new EventsListItemView();
    this._addEventFormComponent = new AddEventFormView();

    render(this._addEventFormListItemComponent, this._addEventFormComponent, RenderPosition.AFTERBEGIN);
    render(this._eventsListComponent, this._addEventFormListItemComponent, RenderPosition.AFTERBEGIN);

    this._addEventFormComponent.setCancelClickHandler(() => {
      this._removeAddEventForm();
    });
    this._addEventFormComponent.setSaveClickHandler(this._handleEventAdd);

    document.addEventListener('keydown', (evt) => onEscKeyDown(evt, () => {
      this._removeAddEventForm();
    }));
  }

  _removeAddEventForm() {
    const eventsCount = this._getEvents().length;

    remove(this._addEventFormComponent);
    remove(this._addEventFormListItemComponent);

    if (!eventsCount) {
      replace(this._noEventsComponent, this._eventsListComponent);
    }

    this._addEventButtonComponent.setDisabled(false);
    document.removeEventListener('keydown', onEscKeyDown);
  }

  _renderTripInfo(events) {
    this._tripInfoComponent = new TripInfoView(events);

    render(this._headerElement, this._tripInfoComponent, RenderPosition.AFTERBEGIN);
  }

  _renderSort() {
    this._eventsSortComponent = new EventsSortView(this._sortType);

    render(this._tripContainer , this._eventsSortComponent, RenderPosition.BEFOREEND);

    this._eventsSortComponent.setSortTypeChangeHandler(this._handleSortTypeChange);
  }

  _initEventPresenter(event) {
    const handlers = {
      updateEvent: this._handleViewAction,
      changeMode: this._handleModeChange,
    };
    const eventPresenter = new Event(this._eventsListComponent, handlers);
    eventPresenter.init(event);
    this._eventPresenter.set(event.id, eventPresenter);
  }

  _renderEventsList(events) {
    events.forEach((event) => this._initEventPresenter(event));
    render(this._tripContainer , this._eventsListComponent, RenderPosition.BEFOREEND);
  }

  _removeTripInfo() {
    remove(this._tripInfoComponent);
    this._tripInfoComponent = null;
  }

  _removeSort() {
    remove(this._eventsSortComponent);
    this._eventsSortComponent = null;
  }

  _replaceEventsListToNoEvents(eventsListComponent) {
    if (!this._noEventsComponent) {
      this._noEventsComponent = new NoEventsView(this._filterType);
    }

    this._removeSort();
    replace(this._noEventsComponent, eventsListComponent);
  }

  _renderNoEvents(filterType) {
    this._noEventsComponent = new NoEventsView(filterType);
    render(this._tripContainer , this._noEventsComponent, RenderPosition.BEFOREEND);
  }

  _clearTrip({ removeTripInfo = false, disableFilters = false, resetSortType = false, disableAddBtn = false } = {}) {
    const eventsCount = this._getEvents().length;
    this._eventPresenter.forEach((presenter) => presenter.destroy());
    this._eventPresenter.clear();

    remove(this._eventsSortComponent);
    remove(this._noEventsComponent);
    remove(this._eventsListComponent);

    this._addEventButtonComponent.setDisabled(false);

    if (disableAddBtn) {
      this._addEventButtonComponent.setDisabled(true);
    }

    if (!eventsCount || removeTripInfo) {
      remove(this._tripInfoComponent);
    }

    if (disableFilters) {
      this._filtersPresenter.disabled = true;
    }

    if (resetSortType) {
      this._sortType = DEFAULT_SORTING;
    }
  }


  _renderTrip() {
    const events = this._getEvents();
    const eventsCount = events.length;
    const filter = this._filtersModel.getFilter();
    const isAddBtnDisbaled = this._addEventButtonComponent.getElement().disabled;
    const isFiltersDisabled = this._filtersPresenter.disabled;

    if (isAddBtnDisbaled) {
      this._addEventButtonComponent.setDisabled(false);
    }

    if (isFiltersDisabled) {
      this._filtersPresenter.disabled = false;
    }

    if (!eventsCount) {
      this._renderNoEvents(filter);
      return;
    }

    this._eventsListComponent = new EventsListView();

    if (!contains(this._headerElement, this._tripInfoComponent)) {
      this._renderTripInfo(events);
    }
    this._renderSort();
    this._renderEventsList(events);
  }

  _reRenderTrip() {
    this._clearTrip();
    this._renderTrip();
  }
}

export default Trip;
