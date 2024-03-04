import i18n from 'i18next';
import { useTranslation } from "react-i18next";
import { TwitterOutlined } from '@ant-design/icons';
import CustomIcon from '@/components/CustomIcon';
import PartnerCard from './PartnerCard';
import ContributorCard from './ContributorCard';
import "../styles/index.scss"
import "../styles/mobile.scss"

export default function HomeContent(params) {

    const { t } = useTranslation();

    return (
        <div className="main-center">
            <div className="main-header">
                <div
                    className={`describe ${
                        i18n.language === "zh-CN" ? "fs-big" : ""
                    }`}
                >
                    {i18n.language === "zh-CN" ? (
                        <img
                            src={require("@/assets/images/img/home-title-zh.png")}
                            alt=""
                        />
                    ) : (
                        <img
                            src={require("@/assets/images/img/home-title-en.png")}
                            alt=""
                        />
                    )}
                </div>
            </div>
            <h2 className="text">{t("home.slogan2")}</h2>
            {/* social */}
            <div className="social">
                <div
                    className="social-item"
                    onClick={() => {
                        window.open("https://twitter.com/decertme", "_blank");
                    }}
                >
                    <TwitterOutlined />
                </div>
                <div
                    className="social-item"
                    onClick={() => {
                        window.open(`https://discord.gg/kuSZHftTqe`, "_blank");
                    }}
                >
                    <CustomIcon type="icon-discord" />
                </div>
            </div>

            {/* list */}
            <div className="listImg">
                <div className="type" onClick={() => navigateTo("/tutorials")}>
                    <img
                        src={require("@/assets/images/img/home-tutorials.png")}
                        alt=""
                    />
                </div>
                <div className="arrow">
                    <img
                        src={require("@/assets/images/img/home-arrow.png")}
                        alt=""
                    />
                </div>
                <div className="type" onClick={() => navigateTo("/challenges")}>
                    <img
                        src={require("@/assets/images/img/home-challenges.png")}
                        alt=""
                    />
                </div>
                <div className="arrow">
                    <img
                        src={require("@/assets/images/img/home-arrow.png")}
                        alt=""
                    />
                </div>
                <div className="type" onClick={() => navigateTo("/vitae")}>
                    <img
                        src={require("@/assets/images/img/home-vitae.png")}
                        alt=""
                    />
                </div>
            </div>

            {/* 愿景 */}
            <div className="vision">
                <h3>{t("home.page.vision.title")}</h3>
                <p>
                    {t("home.page.vision.p1")}&nbsp;<span>Web3.0</span>
                    &nbsp;{t("home.page.vision.p2")}
                </p>
                <p>{t("home.page.vision.p3")}</p>
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
                        <img
                            src={require("@/assets/images/img/home-img2.png")}
                            alt=""
                        />
                    </div>
                </div>

                {/* sbt */}
                <div className="sbt intro-content">
                    <div className="content-l img">
                        <img
                            src={require("@/assets/images/img/home-img3.png")}
                            alt=""
                        />
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
            <PartnerCard />
            {/* 贡献者 */}
            <ContributorCard />
        </div>
    );
}
