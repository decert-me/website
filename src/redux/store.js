import { createStore } from 'redux';

const initialState = {
  isShow: false,
  isConnect: false,
  isDisconnect: false,
  isMobile: false,
  challenge: null,
  user: {},
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
    case 'SET_DISCONNECT':
      return {
        ...state,
        isDisconnect: action.payload
      };  
    case 'SET_MOBILE':
      return {
        ...state, 
        isMobile: action.payload
      }
    case 'SET_USER':
      return {
        ...state,
        user: action.payload
      }
    case 'SET_CHALLENGE':
      return {
        ...state,
        challenge: action.payload
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

export function setDisConnect(isDisconnect) { 
  return { type: 'SET_DISCONNECT', payload: isDisconnect }; 
}

export function hideCustomSigner() {
  return { type: 'HIDE' };
}

export function setMobile(isMobile) { 
  return { type: 'SET_MOBILE', payload: isMobile }; 
}

export function setUser(user) { 
  return { type: 'SET_USER', payload: user }; 
}

export function setChallenge(challenge) { 
  return { type: 'SET_CHALLENGE', payload: challenge }; 
}

export default store;