import { createStore } from 'redux';

const initialState = {
  isShow: false,
  isConnect: false,
  isMobile: false,
  user: {
    nickname: "",
    address: "",
    description: "",
    avatar: "",
    socials: null
  }
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
    case 'SET_USER':
      return {
        ...state,
        user: action.payload
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

export function setUser(user) { 
  return { type: 'SET_USER', payload: user }; 
}

export default store;