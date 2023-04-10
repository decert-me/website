import { createStore } from 'redux';

const initialState = {
  isShow: false
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case 'SHOW':
      return {
        isShow: true
      };
    case 'HIDE':
      return {
        isShow: false
      };
    default:
      return state;
  }
}

const store = createStore(reducer);

export function showCustomSigner() {
    return { type: 'SHOW' };
}

export default store;