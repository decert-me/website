import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";


export default function HomeNotice(params) {

    const TimeOutStamp = 1701360000000;     //  2023-12-01  00:00:00
    const { t } = useTranslation();
    const [isShow, setIsShow] = useState(false);

    useEffect(() => {
        const timestamp = new Date().getTime();
        setIsShow(timestamp < TimeOutStamp);
    },[])
    
    return (
        isShow &&
        <div className="global-prompt">
            <p onClick={() => window.open("https://0xdwong.notion.site/Decert-me-Gitcoin-Grant-54240d546bfb48e4971fdddc66b31c58")}>
                {t("home.global-prompt")}<a href="https://0xdwong.notion.site/Decert-me-Gitcoin-Grant-54240d546bfb48e4971fdddc66b31c58" target="_blank">{t("home.jump")}</a> &gt;&gt;
            </p>
        </div>
    )
}