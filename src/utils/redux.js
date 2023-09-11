import store, { setConnect } from "@/redux/store"


export function changeConnect(params) {
    store.dispatch(setConnect(false))
    store.dispatch(setConnect(true))
    localStorage.clear();
}