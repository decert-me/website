import DefaultLayout from "@/containers/DefaultLayout";
import "@/assets/styles/mobile/antd.scss"
import { constans } from "@/utils/constans";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useMediaQuery } from 'react-responsive'
import store, { setMobile } from "@/redux/store";
import { detectZoom } from "@/utils/detectZoom";

export default function BeforeRouterEnter() {

    const location = useLocation();
    const defaultTitle = "DeCert.me"
    const { screenSize } = constans();
    const m = detectZoom();
    const baseSize = 16;
    const isMobile = useMediaQuery({
        query: screenSize.mobile
    })
    

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

    function setRemUnit() {
        const clientWidth = document.documentElement.clientWidth;
        if (window.screen.width * window.devicePixelRatio >=(1920 * 2)) {
            switch (m) {
              // 4k ==> 100%
              case 100:
                document.body.style.zoom = 100 / (0.625 * 2560);
                break;
                // 4k ==> 125%
              case 125:
                document.body.style.zoom = 100 / (0.625 * 2560);
                break;
                // 4k ==> 150%
              case 150:
                document.body.style.zoom = 100 / (0.75 * 2560);
                break;
                // 4k ==> 175%
              case 175:
                document.body.style.zoom = 100 / (0.874715 * 2560);
                break;
                // 4k ==> 200%
              case 200:
                document.body.style.zoom = 1920 / 2560;
                break;
                // 4k ==> 225%
              case 225:
                document.body.style.zoom = 100 / (1.12485 * 2560);
                break;
            
              default:
                break;
            }
        }
        else if (window.screen.width <= 1770 && window.screen.width >= 1024) {
          document.body.style.zoom = Math.round(window.screen.width / 1770 * 10) / 10;
        }if (clientWidth < 490) {
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