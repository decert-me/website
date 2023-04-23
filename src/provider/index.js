import store from "@/redux/store";
import { useState } from "react";
import MyContext from "./context";

export default function MyProvider(props) {
    let [isMobile, setIsMobile] = useState();

    function handleMobileChange() {
        isMobile = store.getState().isMobile;
        setIsMobile(isMobile);
    }

    store.subscribe(handleMobileChange);

    return (
        <MyContext.Provider value={{ isMobile }}>
          {props.children}
        </MyContext.Provider>
      );
}