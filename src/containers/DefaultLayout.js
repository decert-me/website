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
    backgroundColor: '#fff',
};
  
const footerStyle = {
    height: "300px",
    textAlign: 'center',
    color: '#fff',
    backgroundColor: '#000',
};

export default function DefaultLayout(params) {

    const outlet = useRoutes(routes);
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const { data: signer } = useSigner();
    const navigateTo = useNavigate();
    const location = useLocation();

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
            sign()
        }else if (addr && !address) {
            // 已登陆  ====>  未登录
            ClearStorage();
            isClaim(path);
            isExplore(path);
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