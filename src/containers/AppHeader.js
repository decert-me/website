import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDisconnect } from 'wagmi';
import { Button, Dropdown } from 'antd';
import {
    MenuOutlined,
    CloseOutlined,
    GlobalOutlined
  } from '@ant-design/icons';
import "@/assets/styles/container.scss"
import "@/assets/styles/mobile/container.scss"
import { hashAvatar } from '@/utils/HashAvatar';
import { NickName } from '@/utils/NickName';
import { useWeb3Modal } from "@web3modal/react";
import logo_white from "@/assets/images/svg/logo-white.png";
import logo_normal from "@/assets/images/svg/logo-normal.png";
import { changeConnect } from '@/utils/redux';
import { getUser } from '@/request/api/public';
import store, { setUser } from '@/redux/store';
import { constans } from '@/utils/constans';
import { useWallet } from "@solana/wallet-adapter-react";
import { useAddress } from '@/hooks/useAddress';
import { ClearStorage } from '@/utils/ClearStorage';

export default function AppHeader({ isMobile, user }) {
    
    const { address, walletType, isConnected } = useAddress();
    const { connected, wallet } = useWallet();
    const { imgPath } = constans();
    const { t } = useTranslation();
    const { disconnect } = useDisconnect();
    const navigateTo = useNavigate();
    const location = useLocation();
    const { isOpen, open, close, setDefaultChain } = useWeb3Modal();
    let [isOpenM, setIsOpenM] = useState(false);

    const items = [
        {
            label: (<p onClick={() => navigateTo(`/publish`)}> {t("home.btn-publish")} </p>),
            key: '0',
            icon: '',
        },
        {
            type: 'divider',
        },
        {
            label: (<p onClick={() => navigateTo(`/user/${address}`)}> {t("header.profile")} </p>),
            key: '1',
            icon: '',
        },
        {
            type: 'divider',
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
            key: '2',
            icon: '',
        },
        {
            type: 'divider',
        },
        {
            label: (<p onClick={() => goDisconnect()}> {t("header.disconnect")} </p>),
            key: '3',
            icon: '',
        }
    ]

    const menus = [
        {to: "/tutorials", label: t("header.lesson")},
        {to: "/challenges", label: t("header.explore")},
        {to: "/vitae", label: t("header.cert")}
    ]

    const openModal = async() => {
        if (isMobile) {
            await open({route: "ConnectWallet"})
            setIsOpenM(!isOpenM)
            return
        }
        changeConnect();
    }

    const toggleI18n = () => {
        let lang = i18n.language === 'zh-CN' ? 'en-US' : 'zh-CN';
        i18n.changeLanguage(lang);
        localStorage.setItem("decert.lang", lang)
    }

    function goDisconnect() {
        if (walletType === "evm") {
            disconnect();
            ClearStorage();
        }else{
            wallet.adapter.disconnect();
            ClearStorage();
        }
    }

    async function init(params) {
        const user = await getUser({address: address})
        if (!user.data) {
            return
        }
        const info = {
            nickname: user.data.nickname ? user.data.nickname : NickName(address),
            address: address,
            description: user.data.description,
            avatar: user.data.avatar ? imgPath + user.data.avatar : hashAvatar(address),
            socials: user.data.socials
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
                            <img src={logo_white} alt="" />
                            :
                            <img src={logo_normal} alt="" />
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
                            isConnected && !isOpenM &&
                                <Dropdown
                                    placement="bottomRight" 
                                    menu={{items: items.slice(1,items.length)}}
                                    overlayClassName="mobile-custom-drop-menu"
                                    overlayStyle={{
                                        width: "160px",
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
                                    <Button danger type="primary" onClick={() => disconnect()}>{t("header.disconnect")}</Button>
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
                        {/* <Button 
                            type="ghost"
                            ghost
                            className='custom-btn'
                        >
                            日
                        </Button> */}
                        {
                            isConnected ?
                                <Dropdown
                                    placement="bottom" 
                                    // trigger="click"
                                    // arrow
                                    menu={{items}}
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