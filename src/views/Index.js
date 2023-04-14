import { Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import "@/assets/styles/view-style/index.scss"
import "@/assets/styles/mobile/view-style/index.scss"
import { useTranslation } from "react-i18next";

export default function Index(params) {
    
    const navigateTo = useNavigate();
    const { t } = useTranslation();


    const test = () => {
        message.success({
            content: "wwwwwwwwww",
            
        })

    }

    return (
        <div className="Home ">
            <div className="main">
                <div className="main-center">
                <div className="weight-info">
                    <h3 onClick={success}>DeCert.me</h3>
                    {/* describe */}
                    <div className="describe" onClick={test}>
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
                        onClick={() => {
                            navigateTo("/publish");
                        }}
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