import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAccount, useDisconnect } from 'wagmi';
import { Button, Dropdown } from 'antd';
import {
    MenuOutlined,
    CloseOutlined,
    GlobalOutlined
  } from '@ant-design/icons';
import ModalConnect from '@/components/CustomModal/ModalConnect';
import "@/assets/styles/container.scss"
import "@/assets/styles/mobile/container.scss"
import { hashAvatar } from '@/utils/HashAvatar';
import { NickName } from '@/utils/NickName';
import { useWeb3Modal } from "@web3modal/react";
import logo_white from "@/assets/images/svg/logo-white.png";
import logo_normal from "@/assets/images/svg/logo-normal.png";

export default function AppHeader({ isMobile }) {
    
    const { address, isConnected } = useAccount()
    const { t } = useTranslation();
    const { disconnect } = useDisconnect();
    const navigateTo = useNavigate();
    const location = useLocation();
    let [isConnect, setIsConnect] = useState(false);
    let [isOpenM, setIsOpenM] = useState(false);
    const { isOpen, open, close, setDefaultChain } = useWeb3Modal();

    const dropdown = [
        {
          label: (
            <Link to={"/challenges"}>
                {t("translation:header.explore")}
            </Link>
          ),
          key: '1',
        },
        {
          label: (
            <Link to={"/publish"}>
                {t("translation:home.btn-publish")}
            </Link>
          ),
          key: '2',
        }
    ];

    const items = [
        {
            label: (<p onClick={() => navigateTo(`/user/${address}`)}> {t("translation:header.profile")} </p>),
            key: '1',
            icon: '',
        },
        {
            label: (
                <p onClick={() => {
                    navigateTo(`/${address}`)
                    navigateTo(0)
                }}> 
                    {t("translation:header.cert")} 
                </p>
            ),
            key: '2',
            icon: '',
        },
        {
            label: (<p onClick={() => disconnect()}> {t("translation:header.disconnect")} </p>),
            key: '3',
            icon: '',
        }
    ]

    const menus = [
        {to: "/tutorials", label: t("translation:header.lesson")},
        {to: "/challenges", label: t("translation:header.explore")},
        {to: "/vitae", label: t("translation:header.cert")}
    ]

    const openModal = () => {
        if (isMobile) {
            setIsOpenM(!isOpenM)
            open()
            return
        }
        setIsConnect(true);
    }

    const hideModal = () => {
        setIsConnect(false);
    }

    const toggleI18n = () => {
        let lang = i18n.language === 'zh-CN' ? 'en-US' : 'zh-CN';
        i18n.changeLanguage(lang);
        localStorage.setItem("decert.lang", lang)
    }

    useEffect(() => {
        if (location) {
            setIsOpenM(false);
        }
    },[location])

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
                        menus.map((e,i) => {
                            if (e.to === "/challenges") {
                                return (
                                    <Dropdown
                                        menu={{
                                            items: dropdown
                                        }}
                                        placement="bottomLeft"
                                        key={i}
                                        overlayClassName="challenge-menu"
                                    >
                                        <Link 
                                            to={e.to} 
                                            key={i} 
                                            className={location.pathname.indexOf(e.to) !== -1 ? "active" : ""}
                                        >
                                            {e.label}
                                        </Link>
                                    </Dropdown>
                                )
                            }else{
                                return (
                                    <Link 
                                        to={e.to} 
                                        key={i} 
                                        className={location.pathname.indexOf(e.to) !== -1 ? "active" : ""}
                                    >
                                        {e.label}
                                    </Link>
                                )
                            }
                        }
                        )
                    }
                </div>
                {
                    isMobile ? 
                    <div className='nav-right'>
                        {
                            isConnected && !isOpenM &&
                                <Dropdown
                                    placement="bottomRight" 
                                    menu={{items}}
                                    overlayStyle={{
                                        width: "160px",
                                        fontWeight: 500
                                    }}
                                >
                                    <div className="user">
                                        <img src={hashAvatar(address)} alt="" />
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
                                    <Button danger type="primary" onClick={() => disconnect()}>{t("translation:header.disconnect")}</Button>
                                    :
                                    <Button onClick={() => openModal()}>{t("translation:header.connect")}</Button>
                                }
                                <ModalConnect isModalOpen={isConnect} handleCancel={hideModal} />
                            </div>
                        
                    </div>
                    :
                    <div className='nav-right'>
                        <Button 
                            type="ghost"
                            ghost
                            className='lang custom-btn'
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
                                    arrow
                                    menu={{items}}
                                    
                                >
                                    <div className="user">
                                        <img src={hashAvatar(address)} alt="" />
                                        <p>{NickName(address)}</p>
                                    </div>
                                </Dropdown>
                            :
                            <div>
                                <Button onClick={() => openModal()} className='connect'>{t("translation:header.connect")}</Button>
                                <ModalConnect isModalOpen={isConnect} handleCancel={hideModal} />
                            </div>
                        }
                    </div>
                }

            </div>
        </div>
    )
}