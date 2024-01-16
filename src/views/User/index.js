import { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
    EditOutlined,
    CopyOutlined
} from '@ant-design/icons';
import { Button, Modal, Skeleton } from "antd";
import "@/assets/styles/view-style/user.scss"
import "@/assets/styles/mobile/view-style/user.scss"
import { getChallengeComplete, getChallengeCreate, getUser } from "@/request/api/public";
import { NickName } from "@/utils/NickName";
import { hashAvatar } from "@/utils/HashAvatar";
import ChallengeItem from "@/components/User/ChallengeItem";
import CustomSocial from "@/components/CustomItem/CustomSocial";
import { Copy } from "@/utils/Copy";
import { useTranslation } from "react-i18next";
import { useUpdateEffect } from "ahooks";
import Paginations from "@/components/User/Pagination";
import MyContext from "@/provider/context";
import { constans } from "@/utils/constans";
import { useAddress } from "@/hooks/useAddress";
import { getAddressDid, getKeyFileSignature } from "@/request/api/zk";
import { downloadJsonFile } from "@/utils/file/downloadJsonFile";
import ModalZkCard from "@/components/CustomModal/ModalZkCard";


export default function User(props) {
    
    const { t } = useTranslation(["translation","profile", "explore"]);
    const { imgPath } = constans();
    const navigateTo = useNavigate();
    const [queryParameters] = useSearchParams();
    const searchStatus = queryParameters.get("status");
    const searchType = queryParameters.get("type");
    const { user, isMobile } = useContext(MyContext);
    const { address, walletType } = useAddress();
    const location = useLocation();
    const { address: paramsAddr } = useParams();
    const [didID, setDidID] = useState("");
    const [isKeysFile, setIsKeysFile] = useState(false);
    let [zkModalOpen, setZkModalOpen] = useState();
    let [account, setAccount] = useState();
    let [isMe, setIsMe] = useState();
    let [info, setInfo] = useState();
    let [list, setList] = useState([]);

    let [pageConfig, setPageConfig] = useState({
        page: 1, pageSize: 10, total: null
    });
    let [checkType, setCheckType] = useState(0);
    let [checkStatus, setCheckStatus] = useState(0);
    
    const type = [
        { key: 'complete', label: t("profile:challenge-completed"), children: [
            { key: 0, label: t("profile:type0") },
            { key: 1, label: t("profile:type1") },
            { key: 2, label: t("profile:type2") },
            { key: 3, label: t("explore:review") }

        ]},
        { key: 'publish', label: t("profile:challenge-publish"), children: [
            { key: 0, label: t("profile:type0")}
        ]}
    ]

    const getList = () => {
        if (checkType === 0) {
            // 'complete'
            getChallengeComplete({
                ...pageConfig,
                type: checkStatus,
                address: account
            })
            .then(res => {
                if (res?.data) {
                    list = res.data.list ? res.data.list : [];
                    setList([...list]);
                    pageConfig.total = res.data.total;
                    setPageConfig({...pageConfig});
                }
            })
            // 如果是“可领取”状态，择再获取本地缓存“可领取”，分页
        }else{
            // 'publish'
            getChallengeCreate({
                ...pageConfig,
                address: account
            })
            .then(res => {
                if (res?.data) {
                    list = res.data.list ? res.data.list : [];
                    setList([...list]);
                    pageConfig.total = res.data.total;
                    setPageConfig({...pageConfig});
                }
            })
        }
    }

    const toggleType = (key) => {
        checkType = key;
        setCheckType(checkType);
        checkStatus = 0;
        setCheckStatus(checkStatus);
        pageConfig.page = 1;
        setPageConfig({...pageConfig});
        navigateTo(`${location.pathname}?type=${checkType}`);
    }

    const toggleStatus = (key) => {
        checkStatus = key;
        setCheckStatus(checkStatus);
        navigateTo(`${location.pathname}?type=${checkType}&status=${key}`);
    }

    const togglePage = (page) => {
        pageConfig.page = page;
        setPageConfig({...pageConfig});
        getList();
    }

    async function downloadKeyFile() {
        try {
            const res = await getKeyFileSignature();
            const {key_file} = res?.data;
            downloadJsonFile(key_file, `key_file${Date.now()}.json`)
            setIsKeysFile(false)
        } catch (error) {
            console.log(error);
        }
    }

    const getInfo = async() => {
        const user = await getUser({address: account})
        if (!user.data || isMe) {
            // setSocials("null")
            return
        }
        info = {
            nickname: user.data.nickname ? user.data.nickname : NickName(account),
            address: account,
            description: user.data.description,
            avatar: user.data.avatar ? imgPath + user.data.avatar : hashAvatar(account),
            socials: user.data.socials
        }
        if (localStorage.getItem("decert.address") === account) {            
            getAddressDid()
            .then(res => {
                if (res.data.did) {
                    setDidID(res.data.did);
                }
            })
        }
        setTimeout(() => {
            setInfo({...info})
        }, 1000);
    }

    function scrollFixed(params) {
        const dom = document.querySelector('.User .navbar');
        const box = document.querySelector('.User .User-list');
        const domOffsetTop = dom.offsetTop;
        const scrollPosition = document.documentElement.scrollTop;
        const multiple = document.documentElement.clientWidth / 390;
        if (scrollPosition > domOffsetTop - (multiple * 60)) {
            box.classList.add('fixed');
        } else {
            box.classList.remove('fixed');
        }
    }

    const init = () => {
        account = paramsAddr;
        setAccount(account);
        getInfo();
    }

    useEffect(() => {
        init();
        if (searchStatus || searchType) {
            if (searchStatus) {
                checkStatus = Number(searchStatus);
                setCheckStatus(checkStatus);
            }
            if (searchType) {
                checkType = Number(searchType);
                setCheckType(checkType);
            }
            if ((searchStatus === null || searchStatus == 0) && searchType == 0) {
                getList();
            }
            return
        }
        checkType = location.search.indexOf("created") !== -1 ? 1 : 0;
        setCheckType(checkType)
        getList();
    }, []);

    useEffect(() => {
        if (account !== address) {
            return
        }
        info = user;
        setInfo({...info})
    },[user])

    useUpdateEffect(() => {
        getList();
    },[checkStatus, checkType])

    useEffect(() => {
        isMe = address === account;
        setIsMe(isMe);
    },[address])

    useUpdateEffect(() => {
        navigateTo(0)
    },[paramsAddr])

    useEffect(() => {
        window.addEventListener("scroll", scrollFixed);
        return () => {
            window.removeEventListener("scroll", scrollFixed);
        }
    },[])

    return (
        <>
        <ModalZkCard
            isMobile={isMobile}
            isModalOpen={zkModalOpen}
            handleCancel={() => setZkModalOpen(null)}
        />
        <Modal
            title={t("profile:key")}
            className="modal-keys"
            open={isKeysFile} 
            okText={t("profile:export")}
            onOk={() => downloadKeyFile()} 
            cancelText={t("profile:cancel")}
            onCancel={() => setIsKeysFile(false)}
        >
            <div className="line"></div>
            <div className="did">
                <p className="title">{t("profile:kf.title")}</p>
            </div>
            <div className="keyfile">
                <div>
                    <p className="keyfile-title">{t("profile:kf.ac")}</p>
                    <p className="keyfile-desc">{didID.substring(0,11) + "..." + didID.substring(didID.length - 4, didID.length)}</p>
                </div>
                <CopyOutlined onClick={() => Copy(didID, t("translation:message.success.copy"))} style={{color: "#9E9E9E", cursor: "pointer"}} />
            </div>
        </Modal>
        <div className="User">
            <div className="custom-bg-round"></div>
            <div className="User-info">
                {
                    info ? 
                    (
                        <>
                        <div className="img">
                            <img src={info.avatar} alt="" />
                        </div>
                        <div className="info">
                            <p className="name">
                                {info.nickname ? info.nickname : NickName(info.address)}
                            </p>
                            <p className="address" onClick={() => Copy(info.address, t("translation:message.success.copy"))}>
                                {NickName(info.address)}<CopyOutlined style={{color: "#9E9E9E", marginLeft: "12px"}} />
                            </p>
                            {
                                didID && <div className="did">
                                    <img src={require("@/assets/images/icon/addrToDid.png")} alt="" />
                                    <p className="label">DID</p>
                                    <div className="flex" onClick={() => Copy(didID, t("translation:message.success.copy"))}>
                                        <p>{didID.substring(0,11) + "..." + didID.substring(didID.length - 4, didID.length)}</p>
                                        <CopyOutlined style={{color: "#9E9E9E", marginLeft: "10px"}} />
                                    </div>
                                    <div className="keyfile" onClick={() => setIsKeysFile(true)}>
                                        <img src={require("@/assets/images/icon/icon-download.png")} alt="" />
                                        <p>Keysfile</p>
                                    </div>
                                </div>
                            }
                            <div className="social">
                                <CustomSocial socials={info.socials} />
                            </div>
                            <div className="desc newline-omitted">
                                {info.description ? info.description : t("profile:desc-none")}
                            </div>
                        </div>
                        {
                            isMe &&
                            <Link to={`/user/edit/${address}`}>
                                <Button className="btn" id="hover-btn-line">
                                    <EditOutlined />
                                    {t("translation:btn-edit-profile")}
                                </Button>
                            </Link>
                        }
                        </>
                    )
                    :
                    <Skeleton
                        active
                        avatar
                        paragraph={{
                        rows: 4,
                        }}
                    />
                }
                
            </div>
            <div className="navbar">
                <div className="User-list">
                    <ul className="challenge">
                        {
                            type.map((e,i) => 
                                <li 
                                    key={e.key} 
                                    className={checkType === i ? "active" : ""}
                                    onClick={() => toggleType(i)}
                                >
                                    {e.label}
                                </li>
                            )
                        }
                    </ul>
                    <ul className="status">
                        {
                            type[checkType].children.map((e,i) => 
                                {
                                    if (account !== address && checkType === 0 && i > 0) {
                                        return
                                    }else{
                                        return (
                                            <li 
                                                key={e.key} 
                                                className={checkStatus === i ? "active" : ""}
                                                onClick={() => toggleStatus(e.key)}
                                            >
                                                {e.label}
                                            </li>
                                        )
                                    }
                                }
                            )
                        }
                    </ul>
                </div>
            </div>
            <div className="User-content">
                {
                    list.map(e => 
                        <ChallengeItem 
                            key={e.id} 
                            info={e}
                            profile={{
                                isMe,
                                checkType,
                                address,
                                walletType
                            }}
                            showZk={(info) => {
                                zkModalOpen = info;
                                setZkModalOpen({...zkModalOpen});
                            }}
                        />
                    )
                }
                {
                    list.length === 0 &&
                    <div className="nodata">
                        <p>{t("profile:challenge-none")}</p>
                        {
                            isMe &&
                            <Link to={"/challenges"}>
                                <Button className="nodata-btn">{t("explore:btn-start")}</Button>
                            </Link>
                        }
                    </div>
                }
                <Paginations pageConfig={pageConfig} togglePage={togglePage} />
            </div>
        </div>
        </>
    )
}