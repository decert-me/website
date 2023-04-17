import DefaultLayout from "@/containers/DefaultLayout";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function BeforeRouterEnter() {

    const location = useLocation();
    const defaultTitle = "DeCert.me"

    function changeTitle() {
        let newTitle = document.title;
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

    return (
        <DefaultLayout />
    )
}