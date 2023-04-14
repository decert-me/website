import DefaultLayout from "@/containers/DefaultLayout";
import "@/assets/styles/mobile/antd.scss"
import { constans } from "@/utils/constans";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useMediaQuery } from 'react-responsive'
import store, { setMobile } from "@/redux/store";

export default function BeforeRouterEnter() {

    const location = useLocation();
    const defaultTitle = "DeCert.me"
    const { screenSize } = constans();
    const baseSize = 16;
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

    function setRemUnit() {
        const clientWidth = document.documentElement.clientWidth;
        if (clientWidth < 490) {
            const scale = document.documentElement.clientWidth / 390;
            document.documentElement.style.fontSize = baseSize * Math.min(scale, 2) + 'px'
        }
    }

    useEffect(() => {
        changeTitle();
    },[location])

    useEffect(() => {
        setRemUnit();
        window.addEventListener('resize', setRemUnit);
    
        return () => {
          window.removeEventListener('resize', setRemUnit);
        };
      }, []);

    useEffect(() => {
        store.dispatch(setMobile(isMobile));
    },[isMobile])

    return (
        <DefaultLayout />
    )
}