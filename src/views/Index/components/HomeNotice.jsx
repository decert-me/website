import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";


export default function HomeNotice(params) {

    const TimeOutStamp = 1724284800000;     //  2024-08-22  00:00:00
    const { t } = useTranslation();
    const [isShow, setIsShow] = useState(false);

    useEffect(() => {
        const timestamp = new Date().getTime();
        setIsShow(timestamp < TimeOutStamp);
    },[])
    
    return (
        isShow &&
        <div className="global-prompt">
            <p onClick={() => window.open("https://explorer.gitcoin.co/?utm_source=grants.gitcoin.co&utm_medium=internal_link&utm_campaign=gg19&utm_content=community-rounds#/round/10/44/55")}>
                {t("home.global-prompt")}<a href="https://explorer.gitcoin.co/?utm_source=grants.gitcoin.co&utm_medium=internal_link&utm_campaign=gg19&utm_content=community-rounds#/round/10/44/55" target="_blank">{t("home.jump")}</a> &gt;&gt;
            </p>
        </div>
    )
}