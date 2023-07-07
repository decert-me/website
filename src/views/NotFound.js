import { Button } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";




export default function NotFound(params) {
    
    const { t } = useTranslation();
    const navigateTo = useNavigate();

    return (
        <div className="notfound">
            <img src={require("@/assets/images/img/404.png")} alt="" />
            <p className="notfound-content">{t("notfound")}</p>
            <Button 
                className="btn" 
                id="hover-btn-line"
                onClick={() => navigateTo("/")}
            >{t("toHome")}</Button>
        </div>
    )
}