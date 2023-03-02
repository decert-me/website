import i18n from 'i18next';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAccount, useDisconnect, useSwitchNetwork } from 'wagmi';
import { Button, Dropdown } from 'antd';
import ModalConnect from '@/components/CustomModal/ModalConnect';
import "@/assets/styles/container.scss"
import { hashAvatar } from '../utils/HashAvatar';
import { NickName } from '../utils/NickName';

export default function AppHeader(params) {
    
    const { address, isConnected } = useAccount()
    const { disconnect } = useDisconnect();
    const navigateTo = useNavigate();
    const { switchNetwork } = useSwitchNetwork({
        chainId: Number(process.env.REACT_APP_CHAIN_ID)
    });
    const location = useLocation();
    let [isConnect, setIsConnect] = useState(false);
    let [lang, setLang] = useState();
    let [isHome, setIsHome] = useState();
    
    const LOCALES_LIST = [
        {
            label: "English",
            value: "en_US",
        },
        {
            label: "简体中文",
            value: "zh_CN",
        }
    ];

    const items = [
        // {
        //     label: (<Link to={{pathname: '/myInfo'}}> Profile </Link>),
        //     key: '1',
        //     icon: '',
        // },
        {
            label: (<p onClick={() => disconnect()}> Disconnect </p>),
            key: '2',
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
            isHome = location.pathname === '/' ? true : false;
            setIsHome(isHome);
            lang = location.hash.split("#")[1];
            if (!lang) {
                lang = "en_US"
            }
            setLang(lang);
            i18n.changeLanguage(lang)
        }
    },[location])

    useEffect(() => {
        if (switchNetwork) {
            switchNetwork()
        }
    },[switchNetwork])
    // backgroundColor: 'rgba(0,0,0,0.5)',

    return (
        <div id={`${isHome ? "Header-bg" : "Header"}`}>
            <div className="header-content">
                <div className='nav-left'>
                    <div className="logo" onClick={() => navigateTo("/")}>
                        {/*  */} 
                        {/* <p>Decert.me</p> */}
                        {
                            isHome ? 
                            <img src={require("@/assets/images/img/logo-white.png")} alt="" />
                            :
                            <img src={require("@/assets/images/img/logo-black.png")} alt="" />
                        }
                    </div>
                    <Link to="/explore">探索</Link>
                </div>
                {
                    isConnected ?
                    <div>
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
                    </div>
                    :
                    <div>
                        <Button onClick={() => openModal()}>Connect Wallet</Button>
                        <ModalConnect isModalOpen={isConnect} handleCancel={hideModal} />
                    </div>
                }
            </div>
        </div>
    )
}
// {
//    LOCALES_LIST.map(e => 
//    <Link key={e.value} to={{pathname: location.pathname, hash: e.value}} >
//        {e.label}
//    </Link>  
//    )
// }
// <h1>Header</h1>