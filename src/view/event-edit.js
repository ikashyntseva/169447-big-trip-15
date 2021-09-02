import AddEventFormView from './event-add';

class EventEditView extends AddEventFormView {
  constructor(eventsModel, event) {
    super(eventsModel, event);
    this._exitEditModeListener = this._exitEditModeListener.bind(this);
    this._deleteClickHandler = this._deleteClickHandler.bind(this);
  }

  _exitEditModeListener(evt) {
    evt.preventDefault();
    this._callback.exitEditMode();
  }

  _deleteClickHandler(evt) {
    evt.preventDefault();
    this._callback.deleteClick(EventEditView.parseDataToEvent(this._data));
  }

  setExitEditModeListener(callback) {
    this._callback.exitEditMode = callback;
    this.getElement().querySelector('.event__rollup-btn').addEventListener('click', this._exitEditModeListener);
  }

  setDeleteClickHandler(callback) {
    this._callback.deleteClick = callback;
    this.queryChildElement('.event__reset-btn').addEventListener('click', this._deleteClickHandler);
  }
}
export default EventEditView;
