import { useLocation, useNavigate, useRoutes } from "react-router-dom";
import { Layout } from "antd";
import routes from "@/router";

import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ClearStorage } from "@/utils/ClearStorage";


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
    const navigateTo = useNavigate();
    const location = useLocation();

    const verifySignUpType = (addr, path) => {
        if (addr === null) {
            // 未登录  ====>  登录
            localStorage.setItem("decert.address", address);
        }else if (addr !== address){
            // 已登陆  ====>  切换账号
            ClearStorage();
            localStorage.removeItem('decert.cache');
            if (path.indexOf('claim') !== -1) {
                let url = 'quests/' + path.split('/')[2]
                navigateTo(url)
            }
        }
    }

    useEffect(() => {
        const path = location.pathname;
        const addr = localStorage.getItem('decert.address');
        if (path.indexOf('claim') !== -1) {
            verifySignUpType(addr, path)
        }
    },[address])

    // TODO: 离开claim页面销毁对应tokenId ==> cache
    // useEffect(() => {
    //     setPath(location.pathname);
    //     console.log('location ===>', location);

    //     if (path) {
            
    //     }
        
    // },[location])

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