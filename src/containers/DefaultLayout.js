import { useLocation, useNavigate, useRoutes } from "react-router-dom";
import { Button, Layout, Space, notification } from "antd";
import { CloseOutlined } from '@ant-design/icons';
import routes from "@/router";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import { useContext, useEffect, useState } from "react";
import { ClearStorage } from "@/utils/ClearStorage";
import { useDebounceEffect, useRequest, useUpdateEffect } from "ahooks";
import MyContext from "@/provider/context";
import store from "@/redux/store";
import { useAddress } from "@/hooks/useAddress";
import { useWallet } from "@solana/wallet-adapter-react";
import { useDisconnect, useWalletClient } from "wagmi";
import { getUnreadMessage, readMessage } from "@/request/api/public";
import { useTranslation } from "react-i18next";
import CustomDisconnect from "@/redux/CustomDisconnect";
const { Header, Footer, Content } = Layout;

export default function DefaultLayout(params) {

    const { t } = useTranslation(["translation"]);
    const outlet = useRoutes(routes);
    const navigateTo = useNavigate();
    const location = useLocation();
    const { isMobile, user, callSignature } = useContext(MyContext);
    const [api, contextHolder] = notification.useNotification();
    // const [messageApi, contextHolder] = message.useMessage();
    let [footerHide, setFooterHide] = useState(false);
    let [headerHide, setHeaderHide] = useState(false);
    let [vh, setVh] = useState(100);
    let [msgList, setMsgList] = useState([]);

    const { address, isConnected, walletType } = useAddress();
    const { data: walletClient } = useWalletClient();
    const { wallet, connected } = useWallet();
    const { disconnectAsync } = useDisconnect()

    // 获取当前账号未读信息
    const { runAsync, cancel } = useRequest(getUnreadMessage, {
        pollingInterval: 5000,
        pollingWhenHidden: false,
        manual: true,
        onSuccess: (data) => {
            const lang = localStorage.getItem("decert.lang");
            msgList = data?.data.reverse() || [];
            setMsgList([...msgList]);
            msgList.forEach((msg, i) => {
                api.open({
                    key: msg.ID,
                    duration: 0,
                    message: lang === "en-US" ? msg.title_en : msg.title,
                    description: lang === "en-US" ? msg.content_en : msg.content,
                    closeIcon: (
                        <CloseOutlined onClick={() => readMessage({id: msg.ID})} />
                    ),
                    btn: (
                        <Space>
                            <Button type="link" size="small" onClick={() => {
                                api.destroy(msg.ID);
                                readMessage({id: msg.ID});
                            }}>
                                {t("btn-ok")}
                            </Button>
                            <Button type="primary" size="small" onClick={() => {
                                api.destroy(msg.ID);
                                goClaim(msg);
                            }}>
                                {t("btn-link")}
                            </Button>
                        </Space>
                    )
                });
            })
        },
        onError: (error) => {
        //   message.error(error.message);
        },
    });

    const headerStyle = {
        height: isMobile ? "60px" : "82px",
        lineHeight: isMobile ? "60px" : '82px',
        display: headerHide ? "none" : "block"
    };
      
    const contentStyle = {
        backgroundColor: (location.pathname.indexOf("user") !== -1 && location.pathname.indexOf("user/edit") === -1) ? '#F9F9F9' : "#fff",
        gridTemplateRows: `minmax(${vh}vh, auto)`,
    };
      
    const footerStyle = {
        display: footerHide ? "none" : "block",
    };

    async function goClaim(msg) {
        await readMessage({id: msg.ID});
        navigateTo(`/claim/${msg.token_id}`);
    }

    const verifySignUpType = async(addr) => {
        if (!connected && !isConnected) {
            return
        }

        if (addr && address && addr !== address){
            // 已登陆  ====>  切换账号
            // 判断是否在当前网站
            if (!document.hidden) {
                localStorage.setItem("decert.address", address);
                await callSignature(address, walletType, wallet?.adapter, walletClient)
            }else{
                if (walletType === "evm") {
                    await disconnectAsync();
                }else{
                    await wallet.adapter.disconnect()
                }
                ClearStorage();
            }
        }
    }

    const { run } = useRequest(verifySignUpType, {
        debounceWait: 300,
        manual: true
    });

    const footerChange = () => {
        if (location.pathname === "/publish" || location.pathname.indexOf("/quests") !== -1 || location.pathname.indexOf("/collection") !== -1 || (location.pathname.indexOf("/challenge") !== -1) || (location.pathname.indexOf("/preview") !== -1) || (location.pathname.indexOf("/callback") !== -1)) {
            return true
        }
        return false
    }

    const headerChange = () => {
        if ((location.pathname.indexOf("/preview") !== -1) || (location.pathname.indexOf("/callback") !== -1)) {
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

    useDebounceEffect(() => {
        const token = localStorage.getItem("decert.token");
        if (!address && !isConnected && token) {
            ClearStorage();
            navigateTo(0);
        }
    },[address],{wait: 1000});

    useEffect(() => {
        const path = location.pathname;
        const addr = localStorage.getItem('decert.address');
        run(addr, path)
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
    
    useUpdateEffect(() => {
        const token = localStorage.getItem("decert.token");
        isConnected && token ? runAsync() : cancel()
    },[isConnected])

    return (
        <>
            {contextHolder}
            <Layout className={isMobile ? "Mobile" : ""}>
                <Header style={headerStyle} id="layout-header">
                    <AppHeader isMobile={isMobile} user={user} />
                </Header>
                <Content style={contentStyle} id="layout-content">
                    { outlet }
                </Content>
                <CustomDisconnect store={store} />
                <Footer style={footerStyle} id="layout-footer">
                    <AppFooter isMobile={isMobile} />
                </Footer>
            </Layout>
        </>
    )
}