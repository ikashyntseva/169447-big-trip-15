import { filters } from './filters';
import { navigation } from './navigation';

const tripControls =
  () => `<div class="trip-main__trip-controls  trip-controls">
            ${navigation()}

            ${filters()}
          </div>`;
export { tripControls };
