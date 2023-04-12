import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAccount, useDisconnect } from 'wagmi';
import { Button, Dropdown } from 'antd';
import {
    MenuOutlined,
    CloseOutlined
  } from '@ant-design/icons';
import ModalConnect from '@/components/CustomModal/ModalConnect';
import "@/assets/styles/container.scss"
import "@/assets/styles/mobile/container.scss"
import { hashAvatar } from '@/utils/HashAvatar';
import { NickName } from '@/utils/NickName';

export default function AppHeader({ isMobile }) {
    
    const { address, isConnected } = useAccount()
    const { t } = useTranslation();
    const { disconnect } = useDisconnect();
    const navigateTo = useNavigate();
    const location = useLocation();
    let [isConnect, setIsConnect] = useState(false);
    let [isHome, setIsHome] = useState();
    let [isOpenM, setIsOpenM] = useState(false);

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
        setIsConnect(true);
    }

    const hideModal = () => {
        setIsConnect(false);
    }

    useEffect(() => {
        if (location) {
            isHome = (location.pathname === '/' || location.pathname === '/vitae') ? true : false;
            setIsHome(isHome);
            setIsOpenM(false);
        }
    },[location])

    return (
        <div id={`${isHome ? "Header-bg" : "Header"}`}>
            <div className={`header-content ${isOpenM ? "bg000" : ""}`}>
                <div className='nav-left'>
                    <div className="logo" onClick={() => navigateTo("/")}>
                        {/*  */} 
                        {
                            isHome || isOpenM ? 
                            <img src={require("@/assets/images/img/logo-white.png")} alt="" />
                            :
                            <img src={require("@/assets/images/img/logo-black.png")} alt="" />
                        }
                    </div>
                    {
                        menus.map((e,i) =>
                            <Link to={e.to} key={i}>
                                {e.label}
                            </Link>
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
                                    <MenuOutlined /> 
                                }
                            </div>
                            <div className={`mask-box ${isOpenM ? "mask-box-show" : ""}`}>
                                <ul>
                                {
                                    menus.map((e,i) =>
                                    <li key={i}>
                                        <Link to={e.to}>
                                            {e.label}
                                        </Link>
                                    </li>
                                    )
                                }
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
                            className='lang'
                            onClick={() => {
                                let lang = i18n.language === 'zh-CN' ? 'en-US' : 'zh-CN';
                                i18n.changeLanguage(lang);
                                localStorage.setItem("decert.lang", lang)
                            }}
                        >
                            {i18n.language === 'zh-CN' ? "中文" : "EN"}
                        </Button>
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
                                <Button onClick={() => openModal()}>{t("translation:header.connect")}</Button>
                                <ModalConnect isModalOpen={isConnect} handleCancel={hideModal} />
                            </div>
                        }
                    </div>
                }

            </div>
        </div>
    )
}