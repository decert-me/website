import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAccount, useDisconnect, useSwitchNetwork } from 'wagmi';
import { Button, Dropdown } from 'antd';
import ModalConnect from '@/components/CustomModal/ModalConnect';
import "@/assets/styles/container.scss"
import { hashAvatar } from '@/utils/HashAvatar';
import { NickName } from '@/utils/NickName';

export default function AppHeader(params) {
    
    const { address, isConnected } = useAccount()
    const { t } = useTranslation();
    const { disconnect } = useDisconnect();
    const navigateTo = useNavigate();
    const { switchNetwork } = useSwitchNetwork({
        chainId: Number(process.env.REACT_APP_CHAIN_ID)
    });
    const location = useLocation();
    let [isConnect, setIsConnect] = useState(false);
    let [isHome, setIsHome] = useState();

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

    const openModal = () => {
        setIsConnect(true);
    }

    const hideModal = () => {
        setIsConnect(false);
    }

    useEffect(() => {
        if (location) {
            isHome = (location.pathname === '/' || location.pathname === '/search') ? true : false;
            setIsHome(isHome);
        }
    },[location])

    useEffect(() => {
        if (switchNetwork) {
            switchNetwork()
        }
    },[switchNetwork])

    return (
        <div id={`${isHome ? "Header-bg" : "Header"}`}>
            <div className="header-content">
                <div className='nav-left'>
                    <div className="logo" onClick={() => navigateTo("/")}>
                        {/*  */} 
                        {
                            isHome ? 
                            <img src={require("@/assets/images/img/logo-white.png")} alt="" />
                            :
                            <img src={require("@/assets/images/img/logo-black.png")} alt="" />
                        }
                    </div>
                    <Link to="/lesson">{t("translation:header.lesson")}</Link>
                    <Link to="/explore">{t("translation:header.explore")}</Link>
                    <Link to="/search">{t("translation:header.cert")}</Link>
                </div>

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
            </div>
        </div>
    )
}