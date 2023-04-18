import { Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import "@/assets/styles/view-style/index.scss"
import "@/assets/styles/mobile/view-style/index.scss"
import { useTranslation } from "react-i18next";
import MyContext from "@/provider/context";
import { useContext } from "react";

export default function Index(params) {
    
    const navigateTo = useNavigate();
    const { t } = useTranslation();
    const { isMobile } = useContext(MyContext);

    function goCreate(params) {
        if (isMobile) {
            message.info("请在pc上打开")
            return
        }
        navigateTo("/publish");
    }

    return (
        <div className="Home ">
            <div className="main">
                <div className="main-center">
                <div className="weight-info">
                    <h3>DeCert.me</h3>
                    {/* describe */}
                    <div className="describe">
                    <p>{t("home.slogan1")}</p>
                    </div>
                    {/* text */}
                    <div className="text">
                    <p>{t("home.slogan2")}</p>
                    </div>
                    {/* Explore challenge */}
                    <div className="mar" style={{justifyContent: "center"}}>
                    <Button
                        className="challenge-btn"
                        onClick={() => {
                            navigateTo("/challenges");
                        }}
                    >
                        <span className="btn">{t("home.btn-explore")}</span>
                    </Button>
                    {/* Creative a challenge */}
                    <Button
                        className="creative-btn"
                        onClick={() => goCreate()}
                    >
                        <span className="creative">{t("home.btn-publish")}</span>
                    </Button>
                    </div>
                </div>
                </div>
            </div>
        </div>
    )
}