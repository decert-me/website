import { message } from "antd";
import {
    TwitterOutlined,
    DownOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from "react-router-dom";
import "@/assets/styles/view-style/index.scss"
import "@/assets/styles/mobile/view-style/index.scss"
import { useTranslation } from "react-i18next";
import MyContext from "@/provider/context";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import CustomIcon from "@/components/CustomIcon";
import i18n from 'i18next';
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Index(params) {
    
    const navigateTo = useNavigate();
    const { t } = useTranslation();
    const { isMobile } = useContext(MyContext);
    const location = useLocation();
    let [contributor, setContributor] = useState([]);
    let [count, setCount] = useState(8);    // 贡献者下拉

    const partner = [
        "home-upchain",
        "home-buidler",
        "home-rebase",
        "home-chaintool",
        "home-aspecta",
        "home-nftscan",
    ]

    function goCreate(params) {
        if (isMobile) {
            message.info(t("message.info.mobile-publish"))
            return
        }
        navigateTo("/publish");
    }

    async function getContributor(params) {
        const res = await axios.get("https://api.decert.me/contributors/");
        contributor = res.data
            .split("\n")
            .filter(e => e !== "")
            .map(line => {
                const [name, avatar, link] = line.split(",");
                return { name, avatar, link }
            })
        setContributor([...contributor])
    }

    function dropdown(params) {
        const ofh = document.querySelector(".ofh");
        const content = document.querySelector(".contributor-content");
        const maxHeight = Number(window.getComputedStyle(ofh).maxHeight.replace("px",""));
        const height = Number(window.getComputedStyle(content).height.replace("px",""));
        if (height > maxHeight) {
            count += 40;
            setCount(count)
            ofh.style.maxHeight = isMobile ?
            ofh.style.maxHeight = `calc(${maxHeight + "px" + " + " + 8.625 * 5 + "rem"})`
            :
            maxHeight + (150 + 55 + 58 + 35) * 5 + "px"
        }
    }

        // // 输入数据和密钥
        // const data = 'Hello, world!';
        // const secretKey = 'mySecretKey';

        // // 将字符串转换为 Uint8Array
        // const encoder = new TextEncoder();
        // const dataBytes = encoder.encode(data);
        // const keyBytes = encoder.encode(secretKey);

        // // 使用 subtle crypto API 进行 HMAC-SHA256 计算
        // crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
        // .then(key => crypto.subtle.sign('HMAC', key, dataBytes))
        // .then(hashBuffer => {
        //     const hashArray = Array.from(new Uint8Array(hashBuffer));
        //     const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
        //     console.log('HMAC-SHA256 哈希值:', hashHex);
        // })
        // .catch(error => console.error(error));

    useEffect(() => {
        getContributor();
    },[])

    return (
        <div className="Home ">
            <div className="custom-bg-round"></div>
            <div className="main">
                <div className="main-center">
                    <div className="main-header">
                        <div className={`describe ${i18n.language === "zh-CN" ? "fs-big" : ""}`}>
                            {
                                i18n.language === "zh-CN" ? 
                                <img src={require("@/assets/images/img/home-title-zh.png")} alt="" />
                                :
                                <img src={require("@/assets/images/img/home-title-en.png")} alt="" />
                            }
                        </div>
                    </div>
                        <h2 className="text">{t("home.slogan2")}</h2>

                        {/* social */}
                        <div className="social">
                            <div className="social-item" onClick={()=>{window.open('https://twitter.com/decertme','_blank')}}>
                                <TwitterOutlined />
                            </div>
                            <div className="social-item" onClick={()=>{window.open(`https://discord.gg/kuSZHftTqe`,'_blank')}}>
                                <CustomIcon type="icon-discord" />
                            </div>
                        </div>

                        {/* list */}
                        <div className="listImg">
                            <div className="type" onClick={() => navigateTo("/tutorials")}>
                                <img src={require("@/assets/images/img/home-tutorials.png")} alt="" />
                            </div>
                            <div className="arrow">
                                <img src={require("@/assets/images/img/home-arrow.png")} alt="" />
                            </div>
                            <div className="type" onClick={() => navigateTo("/challenges")}>
                                <img src={require("@/assets/images/img/home-challenges.png")} alt="" />
                            </div>
                            <div className="arrow">
                                <img src={require("@/assets/images/img/home-arrow.png")} alt="" />
                            </div>
                            <div className="type" onClick={() => navigateTo("/vitae")}>
                                <img src={require("@/assets/images/img/home-vitae.png")} alt="" />
                            </div>
                        </div>

                        {/* 愿景 */}
                        <div className="vision">
                            <h3>{t("home.page.vision.title")}</h3>
                            <p>
                            {t("home.page.vision.p1")}&nbsp;<span>Web3.0</span>
                                &nbsp;{t("home.page.vision.p2")}
                            </p>
                            <p>
                            {t("home.page.vision.p3")}
                            </p>
                        </div>

                        <div className="intro">
                            <div className="linear-bg"></div>
                            {/* ai */}
                            <div className="ai intro-content">
                                <div className="content-l">
                                    <h2>{t("home.page.ai.title")}</h2>
                                    <ul>
                                        <li>
                                            <h3>{t("home.page.ai.sub1")}</h3>                                            
                                            <p>{t("home.page.ai.p1")}</p>
                                        </li>
                                        <li>
                                            <h3>{t("home.page.ai.sub2")}</h3>                                            
                                            <p>{t("home.page.ai.p2")}</p>
                                        </li>
                                    </ul>
                                </div>
                                <div className="content-r img">
                                    <img src={require("@/assets/images/img/home-img2.png")} alt="" />
                                </div>
                            </div>

                            {/* sbt */}
                            <div className="sbt intro-content">
                                <div className="content-l img">
                                    <img src={require("@/assets/images/img/home-img3.png")} alt="" />
                                </div>
                                <div className="content-r">
                                    <h2>{t("home.page.sbt.title")}</h2>
                                    <ul>
                                        <li>{t("home.page.sbt.p1")}</li>
                                        <li>{t("home.page.sbt.p2")}</li>
                                        <li>{t("home.page.sbt.p3")}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* 合作伙伴 */}
                        <div className="partner">
                            <div className="partner-content">
                                <p>{t("home.page.partner")}</p>
                                <ul>
                                    {
                                        partner.map(e => 
                                            <li className="img" key={e}>
                                                <img src={require(`@/assets/images/img/${e}.png`)} alt="" />
                                            </li>
                                        )
                                    }
                                </ul>
                            </div>
                        </div>

                        {/* 贡献者 */}
                        <div className="contributor">
                            <p className="contributor-label">{t("home.page.contributor")}</p>
                            <div className="ofh">
                                <div className="contributor-content">
                                    {
                                        contributor.map((e,i) => 
                                            e?.link ? 
                                            <a className="a" href={e.link} target="_blank" key={i}>
                                                <div className="contributor-item img">
                                                    <img src={e.avatar} alt="" />
                                                </div>
                                                <div className={isMobile ? "usernameM" : "username"}>
                                                    {e.name}
                                                </div>
                                            </a>
                                            :
                                            <div className="a">
                                                <div className="contributor-item img">
                                                    <img src={e.avatar} alt="" />
                                                </div>
                                                <div className={isMobile ? "usernameM" : "username"}>
                                                    {e.name}
                                                </div>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                            {/* {
                                contributor.length > count &&
                                <div className="btn-drop" onClick={dropdown}>
                                    <DownOutlined />
                                </div>
                            } */}
                        </div>
                </div>
            </div>
        </div>
    )
}