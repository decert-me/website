import { createStore } from 'redux';

const initialState = {
  isShow: false,
  isConnect: false,
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
    case 'SET_CONNECT':
      return {
        ...state,
        isConnect: action.payload
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

export function setConnect(isConnect) { 
  return { type: 'SET_CONNECT', payload: isConnect }; 
}

export function hideCustomSigner() {
  return { type: 'HIDE' };
}

export function setMobile(isMobile) { 
  return { type: 'SET_MOBILE', payload: isMobile }; 
}

export default store;