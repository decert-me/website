import DefaultLayout from "@/containers/DefaultLayout";
import { constans } from "@/utils/constans";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useMediaQuery } from 'react-responsive'
import store, { setMobile } from "@/redux/store";

export default function BeforeRouterEnter() {

    const location = useLocation();
    const defaultTitle = "DeCert.me"
    const { screenSize } = constans();
    const isMobile = useMediaQuery({
        query: screenSize.mobile
    })

    function changeTitle() {
        let newTitle = document.title;
        console.log(location);
        if (location.pathname.indexOf("/challenges") === 0) {
            newTitle = `CHALLENGES - ${defaultTitle}`;
        }else if (location.pathname.indexOf("/publish") === 0) {
            newTitle = `PUBLISH - ${defaultTitle}`;
        }else if (location.pathname.indexOf("/vitae") === 0) {
            newTitle = `VITAE - ${defaultTitle}`;
        }else if (location.pathname.indexOf("/tutorials") === 0) {
            newTitle = `TUTORIALS - ${defaultTitle}`;
        }else if (location.pathname.indexOf("/user") === 0) {
            newTitle = `PROFILE - ${defaultTitle}`;
        }else{
            newTitle = defaultTitle;
        }
        document.title = newTitle;
    }

    useEffect(() => {
        changeTitle();
    },[location])

    useEffect(() => {
        store.dispatch(setMobile(isMobile));
    },[isMobile])

    return (
        <DefaultLayout />
    )
}