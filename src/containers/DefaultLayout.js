import { useLocation, useNavigate, useRoutes } from "react-router-dom";
import { Layout } from "antd";
import routes from "@/router";

import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import { useEffect, useState } from "react";
import { useAccount, useDisconnect, useSigner, useSwitchNetwork } from "wagmi";
import { ClearStorage } from "@/utils/ClearStorage";
import { useRequest } from "ahooks";
import { GetSign } from "@/utils/GetSign";
const { Header, Footer, Content } = Layout;

export default function DefaultLayout(params) {

    const outlet = useRoutes(routes);
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const { data: signer } = useSigner();
    const navigateTo = useNavigate();
    const location = useLocation();
    let [footerHide, setFooterHide] = useState(false);
    const { switchNetwork } = useSwitchNetwork({
        chainId: Number(process.env.REACT_APP_CHAIN_ID)
    });

    const headerStyle = {
        width: "100%",
        height: "55px",
        lineHeight: '55px',
        padding: 0,
        backgroundColor: 'rgba(0,0,0,0)',
        position: "fixed",
        color: "#fff",
        zIndex: 1
    };
      
    const contentStyle = {
        minHeight: "calc(100vh - 300px)",
        backgroundColor: location.pathname === "/lesson" ? "#F6F7F9" : '#fff',
    };
      
    const footerStyle = {
        height: "300px",
        textAlign: 'center',
        color: '#fff',
        backgroundColor: '#000',
        display: footerHide ? "none" : "block"
    };

    const isClaim = (path) => {
        if (path && path.indexOf('claim') !== -1) {
            let url = 'quests/' + path.split('/')[2]
            navigateTo(url)
        }
    }

    const isExplore = (path) => {
        if (path && path.indexOf('explore') !== -1) {
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
                navigateTo('/search');
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
        await GetSign({address: address, signer: signer, disconnect: disconnect})
    }

    const verifySignUpType = async(addr, path) => {
        if (addr === null && address) {
            // 未登录  ====>  登录
            localStorage.setItem("decert.address", address);
            isCert(path, 'reload');
            sign()
            if (switchNetwork) {
                switchNetwork()
            }
        }else if (addr && address && addr !== address){
            // 已登陆  ====>  切换账号
            ClearStorage();
            localStorage.setItem("decert.address", address);
            isClaim(path);
            isCert(path, 'toggle');
            isUser(path);
            sign()
        }else if (addr && !address) {
            // 已登陆  ====>  未登录
            ClearStorage();
            isClaim(path);
            isExplore(path);
            isCert(path, 'signout');
            isUser(path);
        }
    }

    const { run } = useRequest(verifySignUpType, {
        debounceWait: 500,
        manual: true
    });

    const footerChange = () => {
        if (location.pathname === "/publish") {
            return true
        }
        return false
    }

    useEffect(() => {
        const path = location.pathname;
        const addr = localStorage.getItem('decert.address');
        run(addr, path)
    },[address])

    useEffect(() => {
        window.scrollTo(0, 0);
        footerHide = footerChange() ? true : false;
        setFooterHide(footerHide);
    },[location])

    return (
        <Layout>
            <Header style={headerStyle}>
                <AppHeader />
            </Header>
            <Content style={contentStyle}>
                { outlet }
            </Content>
            <Footer style={footerStyle}>
                <AppFooter />
            </Footer>
        </Layout>
    )
}