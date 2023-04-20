import { useLocation, useNavigate, useRoutes } from "react-router-dom";
import { Layout, message } from "antd";
import routes from "@/router";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import { useContext, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ClearStorage } from "@/utils/ClearStorage";
import { useRequest } from "ahooks";
import CustomSigner from "@/redux/CustomSigner";
import MyContext from "@/provider/context";
import store, { showCustomSigner } from "@/redux/store";
const { Header, Footer, Content } = Layout;

export default function DefaultLayout(params) {

    const outlet = useRoutes(routes);
    const { address } = useAccount();
    const navigateTo = useNavigate();
    const location = useLocation();
    const { isMobile } = useContext(MyContext);
    const [messageApi, contextHolder] = message.useMessage();
    let [footerHide, setFooterHide] = useState(false);

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
        minHeight: isMobile ? "calc(100vh - 108px)" : "calc(100vh - 300px)",
        backgroundColor: location.pathname === "/tutorials" ? "#F6F7F9" : '#fff',
    };
      
    const footerStyle = {
        height: isMobile ? "108px" : "300px",
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
        store.dispatch(showCustomSigner());
    }

    const verifySignUpType = async(addr, path) => {
        if (addr === null && address) {
            // 未登录  ====>  登录
            localStorage.setItem("decert.address", address);
            isCert(path, 'reload');
            sign()
        }else if (addr && address && addr !== address){
            // 已登陆  ====>  切换账号
            ClearStorage();
            localStorage.setItem("decert.address", address);
            isClaim(path);
            isCert(path, 'toggle');
            isExplore(path);
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
        <Layout className={isMobile ? "Mobile" : ""}>
            <Header style={headerStyle}>
                <AppHeader isMobile={isMobile} />
            </Header>
            <Content style={contentStyle}>
                { outlet }
            </Content>
            {contextHolder}
            <CustomSigner store={store} />
            <Footer style={footerStyle}>
                <AppFooter isMobile={isMobile} />
            </Footer>
        </Layout>
    )
}