import { Button, message, Avatar, Tooltip } from "antd";
import {
    TwitterOutlined
} from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import "@/assets/styles/view-style/index.scss"
import "@/assets/styles/mobile/view-style/index.scss"
import { useTranslation } from "react-i18next";
import MyContext from "@/provider/context";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import CustomIcon from "@/components/CustomIcon";

export default function Index(params) {
    
    const navigateTo = useNavigate();
    const { t } = useTranslation();
    const { isMobile } = useContext(MyContext);
    let [contributor, setContributor] = useState([]);

    function goCreate(params) {
        if (isMobile) {
            message.info(t("message.info.mobile-publish"))
            return
        }
        navigateTo("/publish");
    }

    async function getContributor(params) {
        const res = await axios.get("https://raw.githubusercontent.com/decert-me/website/main/contributor");
        console.log(res);
        contributor = res.data
            .split("\n")
            .filter(e => e !== "")
            .map(line => {
                const [name, avatar, link] = line.split(",");
                return { name, avatar, link }
            })
        setContributor([...contributor])
    }

    useEffect(() => {
        getContributor();
    },[])

    return (
        <div className="Home ">
            <div className="main">
                <div className="main-center">
                        <h1 className="describe">{t("home.slogan1")}</h1>
                        <h2 className="text">{t("home.slogan2")}</h2>

                        {/* social */}
                        <div className="social">
                            <div className="social-item">
                                <TwitterOutlined />
                            </div>
                            <div className="social-item">
                                <CustomIcon type="icon-discord" />
                            </div>
                        </div>

                        {/* list */}
                        <div className="listImg img">
                            <img src={require("@/assets/images/img/home-img1.png")} alt="" />
                        </div>

                        {/* 愿景 */}
                        <div className="vision">
                            <h3>我们的愿景</h3>
                            <p>
                                让每个 Builder 在&nbsp;<span>Web3.0</span>
                                &nbsp;时代都拥有可信的履历数据
                            </p>
                            <p>
                                形成一个更自由、更可信、更高效的 Builder 世界。
                            </p>
                        </div>

                        <div className="intro">
                            <div className="linear-bg"></div>
                            {/* ai */}
                            <div className="ai intro-content">
                                <div className="content-l">
                                    <h2>AI时代的教育方式</h2>
                                    <ul>
                                        <li>
                                            <h3>全民1对1辅导</h3>                                            
                                            <p>通过AI，可以为所有学员带来一对一的辅导，让学员有更深刻的理解、自信</p>
                                        </li>
                                        <li>
                                            <h3>AI助教</h3>                                            
                                            <p>AI帮助教育工作者制作更好的课程计划，跟踪学生反馈，提升教学水平</p>
                                        </li>
                                        <li>
                                            <h3>专家训练</h3>                                            
                                            <p>AI由不同领域专家训练，确保质量和准确性</p>
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
                                    <h2>SBT - 学习成果证明</h2>
                                    <h2>Proof of Learn</h2>
                                    <ul>
                                        <li>履历认证</li>
                                        <li>DID 社交图谱</li>
                                        <li>多维度履历证明</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* 合作伙伴 */}
                        <div className="partner">
                            <p>合作伙伴</p>
                            <ul>
                                <li></li>
                                <li></li>
                                <li></li>
                                <li></li>
                            </ul>
                        </div>

                        {/* 贡献者 */}
                        <div className="contributor">
                            <p>贡献者</p>
                            {
                                isMobile ? 
                                <Avatar.Group>
                                    {
                                        contributor.map((e,i) => 
                                            <a href={e.link} target="_blank" key={i}>
                                                <Tooltip title={e.name} placement="top">
                                                    <Avatar src={e.avatar} />
                                                </Tooltip>
                                            </a>
                                        )
                                    }
                                </Avatar.Group>
                                :
                                <div className="contributor-content">
                                    {
                                        contributor.map((e,i) => 
                                            <a href={e.link} target="_blank" key={i}>
                                                <Tooltip title={e.name} placement="top">
                                                    <div className="contributor-item img">
                                                        <img src={e.avatar} alt="" />
                                                    </div>
                                                </Tooltip>
                                            </a>
                                        )
                                    }
                                </div>
                            }
                        </div>
                </div>
            </div>
        </div>
    )
}