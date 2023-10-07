import { useLocation, useNavigate, useRoutes } from "react-router-dom";
import { Layout, message } from "antd";
import routes from "@/router";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import { useContext, useEffect, useState } from "react";
import { ClearStorage } from "@/utils/ClearStorage";
import { useRequest, useUpdateEffect } from "ahooks";
import CustomSigner from "@/redux/CustomSigner";
import CustomConnect from "@/redux/CustomConnect";
import MyContext from "@/provider/context";
import store, { hideCustomSigner, showCustomSigner } from "@/redux/store";
import { useWeb3Modal } from "@web3modal/react";
import { useAddress } from "@/hooks/useAddress";
import { useWallet } from "@solana/wallet-adapter-react";
const { Header, Footer, Content } = Layout;

export default function DefaultLayout(params) {

    const outlet = useRoutes(routes);
    const navigateTo = useNavigate();
    const location = useLocation();
    const { isMobile, user } = useContext(MyContext);
    const { close } = useWeb3Modal();
    const [messageApi, contextHolder] = message.useMessage();
    let [footerHide, setFooterHide] = useState(false);
    let [headerHide, setHeaderHide] = useState(false);
    let [vh, setVh] = useState(100);

    const { address } = useAddress();
    const { connected } = useWallet();

    const headerStyle = {
        width: "100%",
        height: isMobile ? "60px" : "82px",
        lineHeight: isMobile ? "60px" : '82px',
        padding: 0,
        backgroundColor: 'rgba(0,0,0,0)',
        position: "fixed",
        color: "#fff",
        zIndex: 999,
        display: headerHide ? "none" : "block"
    };
      
    const contentStyle = {
        backgroundColor: location.pathname.indexOf("user") === -1 ? '#fff' : "#F9F9F9",
        overflow: "hidden",
        display: "grid",
        gridTemplateRows: `minmax(${vh}vh, auto)`,
    };
      
    const footerStyle = {
        height: "auto",
        padding: 0,
        textAlign: 'center',
        color: '#fff',
        backgroundColor: '#000',
        display: footerHide ? "none" : "block",
    };

    const isClaim = (path) => {
        if (path && path.indexOf('claim') !== -1) {
            let url = 'quests/' + path.split('/')[2]
            navigateTo(url)
        }
    }

    const isExplore = (path) => {
        if (path && path.indexOf('challenges') !== -1) {
            navigateTo(0)
        }
    }

    const isCert = (path, type) => {
        if (path && path.split('/')[1].length === 42) {
            if (type === "toggle") {
                navigateTo(`/${address}`);
                navigateTo(0);
                setTimeout(() => {
                }, 20);
            }else if (type === "signout"){
                setTimeout(() => {
                    navigateTo(0);
                }, 500);
            }else{
                setTimeout(() => {
                    navigateTo(0);
                }, 500);
            }
        }
    }

    const isUser = (path) => {
        if (path && path.indexOf('user') !== -1) {
            if (!address) {
                navigateTo(0);
            }else{
                navigateTo(`/user/${address}`);
            }
        }
    }
    
    const sign = async() => {
        await store.dispatch(hideCustomSigner());
        await store.dispatch(showCustomSigner());
    }

    const verifySignUpType = async(addr, path) => {
        if (address && isMobile && localStorage.getItem("decert.token")) {
            close()
        }
        if (addr === null && address) { 
            // 未登录  ====>  登录
            localStorage.setItem("decert.address", address);
            await sign()
            // isCert(path, 'reload');
        }else if (addr && address && addr !== address){
            // 已登陆  ====>  切换账号
            ClearStorage();
            localStorage.setItem("decert.address", address);
            isClaim(path);
            isCert(path, 'toggle');
            isExplore(path);
            isUser(path);
            sign()
        }
    }

    const { run } = useRequest(verifySignUpType, {
        debounceWait: 500,
        manual: true
    });

    const footerChange = () => {
        if (location.pathname === "/publish" || location.pathname.indexOf("/quests") !== -1 || (location.pathname.indexOf("/challenge") !== -1) || (location.pathname.indexOf("/preview") !== -1)) {
            return true
        }
        return false
    }

    const headerChange = () => {
        if ((location.pathname.indexOf("/preview") !== -1)) {
            return true
        }
        return false
    }

    function zoomVh(params) {
        if (window.screen.width <= 1770 && window.screen.width >= 1024) {
            const zoom = Math.round(window.screen.width / 1770 * 10) / 10;
            vh = 1 / zoom * 100;
            setVh(vh);
        }else{
            setVh(100)
        }
    }

    useEffect(() => {
        const path = location.pathname;
        const addr = localStorage.getItem('decert.address');
        !document.hidden && run(addr, path)
    },[address, connected])

    useEffect(() => {
        zoomVh()
        window.scrollTo(0, 0);
        footerHide = footerChange();
        setFooterHide(footerHide);

        headerHide = headerChange();
        setHeaderHide(headerHide);
    },[location])

    useEffect(() => {
        window.addEventListener("resize", zoomVh);
        return () => {
          window.removeEventListener("resize", zoomVh);
        };
    }, []);

    return (
        <Layout className={isMobile ? "Mobile" : ""}>
            <Header style={headerStyle}>
                <AppHeader isMobile={isMobile} user={user} />
            </Header>
            <Content style={contentStyle}>
                { outlet }
            </Content>
            {contextHolder}

            <CustomSigner store={store} />
            <CustomConnect store={store} />

            <Footer style={footerStyle}>
                <AppFooter isMobile={isMobile} />
            </Footer>
        </Layout>
    )
}