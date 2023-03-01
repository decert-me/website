import { useRoutes } from "react-router-dom";
import { Layout } from "antd";
import routes from "@/router";

import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

const { Header, Footer, Content } = Layout;

const headerStyle = {
    width: "100%",
    height: "55px",
    lineHeight: '55px',
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: "absolute",
    color: "#fff"
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

    useEffect(() => {
        if (isConnected === true && address !== localStorage.getItem('decert.address')) {
            localStorage.removeItem('decert.token');
            localStorage.setItem("decert.address", address);
        }
        if (!isConnected) {
            localStorage.removeItem('decert.token');
        }
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