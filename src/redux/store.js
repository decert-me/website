import { createStore } from 'redux';

const initialState = {
  isShow: false,
  isMobile: false
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case 'SHOW':
      return {
        ...state,
        isShow: true
      };
    case 'HIDE':
      return {
        ...state,
        isShow: false
      };
    case 'SET_MOBILE':
      return {
        ...state, 
        isMobile: action.payload
      }
    default:
      return state;
  }
}

const store = createStore(reducer);

export function showCustomSigner() {
    return { type: 'SHOW' };
}

export function hideCustomSigner() {
  return { type: 'HIDE' };
}

export function setMobile(isMobile) { 
  return { type: 'SET_MOBILE', payload: isMobile }; 
}

export default store;