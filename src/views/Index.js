import { message } from "antd";
import {
    TwitterOutlined,
    DownOutlined
} from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import "@/assets/styles/view-style/index.scss"
import "@/assets/styles/mobile/view-style/index.scss"
import { useTranslation } from "react-i18next";
import MyContext from "@/provider/context";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import CustomIcon from "@/components/CustomIcon";
import { useRequest, useUpdateEffect } from "ahooks";
import i18n from 'i18next';

export default function Index(params) {
    
    const navigateTo = useNavigate();
    const { t } = useTranslation();
    const { isMobile } = useContext(MyContext);
    let [contributor, setContributor] = useState([]);
    let [count, setCount] = useState(8);    // 贡献者下拉

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

    function scale(params) {
        const dom = document.querySelector(".Home");
        if (window.innerWidth < 1920 && !isMobile) {
            console.log(isMobile);
            // 只缩小
            // document.body.style.zoom = window.innerWidth / 1940;
            dom.style.zoom = window.innerWidth / 1950;
        }
    }

    const { run } = useRequest(scale, {
        debounceWait: 300,
        manual: true,
    });

    useEffect(() => {
        getContributor();
    },[])

    useUpdateEffect(() => {
        scale();
    },[isMobile])

    useEffect(() => {
        window.addEventListener("resize", run);
    
        return () => {
          window.removeEventListener("resize", run);
        };
    }, []);

    function test(event) {
            // Cancel the event as stated by the standard.
            // 添加上 会出现弹窗，不添加则会静默执行回调函数内的任务，下面同这条类似作用，只是处理兼容问题
            event.preventDefault();
            // Chrome requires returnValue to be set.
            event.returnValue = '';
    }


    useEffect(() => {
        window.addEventListener('beforeunload', test);
        return () => {
            window.removeEventListener("beforeunload", test);
        }
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
                            <div className="social-item" onClick={()=>{window.open(`https://discord.gg/${process.env.REACT_APP_DISCORD_VERIFY_INVITE_LINK}`,'_blank')}}>
                                <CustomIcon type="icon-discord" />
                            </div>
                        </div>

                        {/* list */}
                        <div className="listImg img">
                            {
                                i18n.language !== "zh-CN" ? 
                                <img src={require("@/assets/images/img/home-img1-en.png")} alt="" />
                                :
                                <img src={require("@/assets/images/img/home-img1.png")} alt="" />
                        }
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
                                    <li className="img">
                                        <img src={require("@/assets/images/img/home-partner1.png")} alt="" />
                                    </li>
                                    <li className="img">
                                        <img src={require("@/assets/images/img/home-partner2.png")} alt="" />
                                    </li>
                                    <li className="img">
                                        <img src={require("@/assets/images/img/home-partner3.png")} alt="" />
                                    </li>
                                    <li className="img">
                                        <img src={require("@/assets/images/img/home-partner4.png")} alt="" />
                                    </li>
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
                                            <a href={e.link} target="_blank" key={i}>
                                                <div className="contributor-item img">
                                                    <img src={e.avatar} alt="" />
                                                </div>
                                                <div className={isMobile ? "usernameM" : "username"}>
                                                    {e.name}
                                                </div>
                                            </a>
                                        )
                                    }
                                </div>
                            </div>
                            {
                                contributor.length > count &&
                                <div className="btn-drop" onClick={dropdown}>
                                    <DownOutlined />
                                </div>
                            }
                        </div>
                </div>
            </div>
        </div>
    )
}