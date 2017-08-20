import { FETCH_SURVEYS } from '../actions/types';

export default (state = [], { type, payload }) => {
  switch (type) {
    case FETCH_SURVEYS:
      return payload;
    default:
      return state;
  }
};
