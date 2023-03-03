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
    const [path, setPath] = useState();

    useEffect(() => {
        if (isConnected === true && address !== localStorage.getItem('decert.address')) {
            ClearStorage();
            localStorage.setItem("decert.address", address);
            navigateTo('/')
        }
        if (!isConnected) {
            localStorage.removeItem('decert.token')
            localStorage.removeItem("decert.address");
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