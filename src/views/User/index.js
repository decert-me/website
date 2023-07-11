import { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import {
    EditOutlined,
    CopyOutlined
} from '@ant-design/icons';
import { Button, Skeleton } from "antd";
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


export default function User(props) {
    
    const { t } = useTranslation(["translation","profile", "explore"]);
    const navigateTo = useNavigate();
    const { user } = useContext(MyContext);
    const { address } = useAccount();
    const location = useLocation();
    const { address: paramsAddr } = useParams();
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
            { key: 2, label: t("profile:type2") }
        ]},
        { key: 'publish', label: t("profile:challenge-publish"), children: [
            { key: 0, label: t("profile:type0")}
        ]}
    ]

    const getList = () => {
        if (checkType === 0) {
            let claimable;
            if (isMe) {
                const cache = JSON.parse(localStorage.getItem("decert.cache"));
                if (cache?.claimable && cache.claimable.length > 0) {
                    // 如果有可领取的
                    claimable = JSON.stringify(cache.claimable);
                }
            }
            // 'complete'
            getChallengeComplete({
                ...pageConfig,
                type: checkStatus,
                address: account,
                claimable
            })
            .then(res => {
                if (res?.data) {
                    list = res.data.list ? res.data.list : [];
                    setList([...list]);
                    pageConfig.total = res.data.total;
                    setPageConfig({...pageConfig});
                }
            })
            let claimableArr = []
            if (claimable) {
                claimableArr = JSON.parse(claimable);
            }
            if (claimableArr && claimableArr.length > 0) {
                list.map(e => {
                    claimableArr.map((ele,index) => {
                        if (e.tokenId == ele.token_id && e.claimed) {
                            const newCache = JSON.parse(localStorage.getItem("decert.cache"));
                            newCache.claimable.splice(index,1);
                            localStorage.setItem("decert.cache", JSON.stringify(newCache));
                        }
                    })
                })
            }
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
    }

    const toggleStatus = (key) => {
        checkStatus = key;
        setCheckStatus(checkStatus);
    }

    const togglePage = (page) => {
        pageConfig.page = page;
        setPageConfig({...pageConfig});
        getList();
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
            avatar: user.data.avatar ? process.env.REACT_APP_BASE_URL + user.data.avatar : hashAvatar(account),
            socials: user.data.socials
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
        checkType = location.search.indexOf("created") !== -1 ? 1 : 0;
        setCheckType(checkType)
        init();
    }, []);

    useEffect(() => {
        if (account !== address) {
            return
        }
        info = user;
        setInfo({...info})
    },[user])

    useEffect(() => {
        getList();
    },[checkStatus, checkType])

    useEffect(() => {
        window.addEventListener("scroll", scrollFixed);
        return () => {
            window.removeEventListener("scroll", scrollFixed);
        }
    },[])

    useUpdateEffect(() => {
        isMe = address === account;
        setIsMe(isMe);
        init();
        getList();
    },[address])

    useUpdateEffect(() => {
        navigateTo(0)
    },[location])

    return (
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
                            <div className="social">
                                {/* <div className="icon"></div> */}
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
                                address
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
    )
}