import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useConnect, useDisconnect } from 'wagmi';
import { Button, Dropdown, message } from 'antd';
import { MenuOutlined, CloseOutlined, GlobalOutlined } from '@ant-design/icons';
import { hashAvatar } from '@/utils/HashAvatar';
import { NickName } from '@/utils/NickName';
import { getUser } from '@/request/api/public';
import store, { setUser } from '@/redux/store';
import { constans } from '@/utils/constans';
import { useWallet } from "@solana/wallet-adapter-react";
import { useAddress } from '@/hooks/useAddress';
import { ClearStorage } from '@/utils/ClearStorage';
import MyContext from '@/provider/context';
import SelectNetwork from '@/components/Network/SelectNetwork';

export default function AppHeader({ isMobile, user }) {
    
    const { address, walletType, isConnected } = useAddress();
    const { connectWallet, connectMobile } = useContext(MyContext);
    const { wallet } = useWallet();
    const { imgPath } = constans();
    const { t } = useTranslation();
    const { connect, connectors } = useConnect({
        onError(err){
            console.log(err);
        }
    })
    const { disconnectAsync } = useDisconnect();
    const navigateTo = useNavigate();
    const location = useLocation();
    let [isOpenM, setIsOpenM] = useState(false);

    const items = [
        {
            label: (<p onClick={() => navigateTo(`/user/${address}`)}> {t("header.profile")} </p>),
            key: '0',
            icon: <img style={{width: "16px", height: "16px"}} src={require("@/assets/images/icon/header-user.png")} alt="" />,
        },
        {
            label: (
                <p onClick={() => {
                    navigateTo(`/${address}`)
                    navigateTo(0)
                }}> 
                    {t("header.cert")} 
                </p>
            ),
            key: '1',
            icon: <img style={{width: "16px", height: "16px"}} src={require("@/assets/images/icon/header-cert.png")} alt="" />,
        },
        {
            type: 'divider',
        },
        {
            label: (<p onClick={() => {
                if (walletType === "solana") {
                    message.info(t("translation:message.info.solana-publish"))
                    return
                }
                navigateTo(`/publish`)
            }}> {t("home.btn-publish")} </p>),
            key: '2',
            icon: <img style={{width: "16px", height: "16px"}} src={require("@/assets/images/icon/header-publish.png")} alt="" />,
        },
        {
            label: (<p onClick={() => {
                if (walletType === "solana") {
                    message.info(t("translation:message.info.solana-publish"))
                    return
                }
                navigateTo(`/rating`)
            }}>{t("header.rate")}</p>),
            key: '3',
            icon: <img style={{width: "16px", height: "16px"}} src={require("@/assets/images/icon/header-rate.png")} alt="" />,
        },
        {
            type: 'divider',
        },
        {
            label: (<p onClick={() => goDisconnect()}> {t("header.disconnect")} </p>),
            key: '4',
            icon: <img style={{width: "16px", height: "16px"}} src={require("@/assets/images/icon/header-exit.png")} alt="" />,
        }
    ]

    const unAdminItems = [
        {
            label: (<p onClick={() => navigateTo(`/user/${address}`)}> {t("header.profile")} </p>),
            key: '0',
            icon: <img style={{width: "16px", height: "16px"}} src={require("@/assets/images/icon/header-user.png")} alt="" />,
        },
        {
            label: (
                <p onClick={() => {
                    navigateTo(`/${address}`)
                    navigateTo(0)
                }}> 
                    {t("header.cert")} 
                </p>
            ),
            key: '1',
            icon: <img style={{width: "16px", height: "16px"}} src={require("@/assets/images/icon/header-cert.png")} alt="" />,
        },
        {
            type: 'divider',
        },
        {
            label: (<p onClick={() => {
                if (walletType === "solana") {
                    message.info(t("translation:message.info.solana-publish"))
                    return
                }
                navigateTo(`/rating`)
            }}>{t("header.rate")}</p>),
            key: '3',
            icon: <img style={{width: "16px", height: "16px"}} src={require("@/assets/images/icon/header-rate.png")} alt="" />,
        },
        {
            type: 'divider',
        },
        {
            label: (<p onClick={() => goDisconnect()}> {t("header.disconnect")} </p>),
            key: '4',
            icon: <img style={{width: "16px", height: "16px"}} src={require("@/assets/images/icon/header-exit.png")} alt="" />,
        }
    ]

    const menus = [
        {to: "/tutorials", label: t("header.lesson")},
        {to: "/challenges", label: t("header.explore")},
        {to: "/vitae", label: t("header.cert")}
    ]

    const openModal = async() => {
        if (isMobile) {
            connectMobile();
            setIsOpenM(!isOpenM);
            return
        }
        connectWallet();
    }

    const toggleI18n = () => {
        const path = location.pathname;
        let lang = i18n.language === 'zh-CN' ? 'en-US' : 'zh-CN';
        localStorage.setItem("decert.lang", lang)
        //  指定页面刷新 内容
        if (path === "/challenges" || 
            path.indexOf("/quests") !== -1 || 
            path.indexOf("/user") !== -1 || 
            path.indexOf("/claim") !== -1 ||
            path.indexOf("/collection") !== -1
        ) {
            setTimeout(() => {
                navigateTo(0)
            }, 40);
            return
        }
        i18n.changeLanguage(lang);

    }

    async function goDisconnect() {
        if (walletType === "evm") {
            await disconnectAsync();
        }else{
            await wallet.adapter.disconnect()
        }
        ClearStorage();

        // 判断是否是claim页
        const path = location.pathname;
        if (path && path.indexOf('claim') !== -1) {
            navigateTo(0)
        }
    }
    
    const decertToken = (event) => {
        event.key === "decert.token" && localStorage.getItem('token') && init(localStorage.getItem("decert.address"));
    }

    async function init(addr) {
        const user = await getUser({address: addr||address})
        if (!user.data) {
            return
        }
        const info = {
            nickname: user.data.nickname ? user.data.nickname : NickName(addr||address),
            address: addr||address,
            description: user.data.description,
            avatar: user.data.avatar ? imgPath + user.data.avatar : hashAvatar(addr||address),
            socials: user.data.socials,
            isAdmin: user.data.is_admin
        }
        store.dispatch(setUser(info));
    }

    useEffect(() => {
        if (location) {
            setIsOpenM(false);
        }
    },[location])

    useEffect(() => {
        address && init();
    },[address])

    useEffect(() => {
        var orignalSetItem = localStorage.setItem;
        localStorage.setItem = function(key,newValue){
            var setItemEvent = new Event("setItemEvent");
            setItemEvent.key = key;
            setItemEvent.newValue = newValue;
            setItemEvent.oldValue = localStorage.getItem(key);
            window.dispatchEvent(setItemEvent);
            orignalSetItem.apply(this,arguments);
        }
        window.addEventListener('setItemEvent', decertToken)
        return () => {
            window.removeEventListener('setItemEvent', decertToken)
        }
    }, [])

    return (
        <div id="Header">
            <div className={`header-content ${isOpenM ? "bg000" : ""}`}>
                <div className='nav-left'>
                    <div 
                        className="logo" 
                        onClick={() => navigateTo("/")} 
                    >
                        {
                            isOpenM ? 
                            <img src={require("@/assets/images/svg/logo-white.png")} alt="" />
                            :
                            <img src={require("@/assets/images/svg/logo-normal.png")} alt="" />
                        }
                    </div>
                    {
                        menus.map((e,i) => <Link 
                                        to={e.to} 
                                        key={i} 
                                        className={location.pathname.indexOf(e.to) !== -1 ? "active" : ""}
                                    >
                                        {e.label}
                                    </Link>
                    )}
                </div>
                {
                    isMobile ? 
                    <div className='nav-right'>
                        {
                            isConnected && 
                            <SelectNetwork />
                        }
                        {
                            isConnected && !isOpenM &&
                                <Dropdown
                                    placement="bottomRight" 
                                    menu={{items: items.filter((e, i) => i!== 3 )}}
                                    // overlayClassName="mobile-custom-drop-menu"
                                    overlayClassName="custom-dropmenu"
                                    overlayStyle={{
                                        width: "210px",
                                        fontWeight: 500
                                    }}
                                >
                                    <div className="user">
                                        <img src={user?.avatar} alt="" />
                                    </div>
                                </Dropdown>
                        }
                            
                            <div 
                                className={isOpenM ? "cfff":""}
                                style={{fontSize: "16px"}}
                                onClick={() => {setIsOpenM(!isOpenM)}} 
                            >
                                {
                                    isOpenM ?
                                    <CloseOutlined />
                                    :
                                    <MenuOutlined style={{color: "#8F5A35"}} /> 
                                }
                            </div>
                            <div className={`mask-box ${isOpenM ? "mask-box-show" : ""}`}>
                                <ul>
                                {
                                    menus.map((e,i) =>
                                    <Link to={e.to} key={i}>
                                        <li>
                                            {e.label}
                                        </li>
                                    </Link>
                                    )
                                }
                                    <li className="toggle" onClick={() => toggleI18n()}>
                                        <GlobalOutlined className='icon' />
                                        <p>{i18n.language === 'zh-CN' ? "中文" : "EN"}</p>
                                    </li>
                                </ul>

                                {
                                    isConnected ?
                                    <Button danger type="primary" onClick={() => goDisconnect()}>{t("header.disconnect")}</Button>
                                    :
                                    <Button onClick={() => openModal()}>{t("header.connect")}</Button>
                                }
                            </div>
                        
                    </div>
                    :
                    <div className='nav-right'>
                        <Button 
                            type="ghost"
                            ghost
                            className='lang custom-btn'
                            id='hover-btn-line'
                            onClick={() => toggleI18n()}
                        >
                            {i18n.language === 'zh-CN' ? "CN" : "EN"}
                        </Button>
                        {/* TODO: 日间模式:夜晚模式 */}
                        {
                            isConnected ?
                                <>
                                    <SelectNetwork />
                                    <Dropdown
                                        placement="bottom" 
                                        // trigger="click"
                                        // arrow
                                        menu={{
                                            items: user?.isAdmin ? items : unAdminItems
                                        }}
                                        overlayClassName="custom-dropmenu"
                                        overlayStyle={{
                                            width: "210px"
                                        }}
                                    >
                                        <div className="user" id="hover-btn-line">
                                            <img src={user?.avatar} alt="" />
                                            <p>{NickName(address)}</p>
                                        </div>
                                    </Dropdown>
                                </>
                            :
                            <div>
                                <Button 
                                    onClick={() => openModal()} 
                                    id='hover-btn-full'
                                    className='connect'
                                >{t("header.connect")}</Button>
                            </div>
                        }
                    </div>
                }

            </div>
        </div>
    )
}