import Api from '../api';
import { END_POINT, AUTHORIZATION } from '../const';

const api = new Api(END_POINT, AUTHORIZATION);

let availableOffers;

const getOffers = async () => {
  availableOffers = await api.getOffers();
};

getOffers();

export { availableOffers };
