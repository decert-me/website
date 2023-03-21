import { useLocation, useNavigate, useRoutes } from "react-router-dom";
import { Layout } from "antd";
import routes from "@/router";

import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import { useEffect } from "react";
import { useAccount, useDisconnect, useSigner } from "wagmi";
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
                navigateTo(`/${address}`)
            }else{
                navigateTo('/search')
            }
        }
    }

    const sign = () => {
        GetSign({address: address, signer: signer, disconnect: disconnect})
    }

    const verifySignUpType = (addr, path) => {
        if (addr === null && address) {
            // 未登录  ====>  登录
            localStorage.setItem("decert.address", address);
            sign()
        }else if (addr && address && addr !== address){
            // 已登陆  ====>  切换账号
            ClearStorage();
            localStorage.setItem("decert.address", address);
            isClaim(path);
            isCert(path, 'toggle');
            sign()
        }else if (addr && !address) {
            // 已登陆  ====>  未登录
            ClearStorage();
            isClaim(path);
            isExplore(path);
            isCert(path, 'signout');
        }
    }

    const { run } = useRequest(verifySignUpType, {
        debounceWait: 500,
        manual: true
    });

    useEffect(() => {
        const path = location.pathname;
        const addr = localStorage.getItem('decert.address');
        run(addr, path)
    },[address])

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