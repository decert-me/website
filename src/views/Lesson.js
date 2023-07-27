import "@/assets/styles/view-style/lesson.scss"
import "@/assets/styles/mobile/view-style/lesson.scss"
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAccount } from "wagmi";
import { tutorialProgress } from "@/request/api/public";

export default function Lesson(params) {
    
    const { t } = useTranslation();
    const { address } = useAccount();
    let [tutorials, setTutorials] = useState([]);

    async function getProgress(params) {
        for (let i = 0; i < tutorials.length; i++) {
            await tutorialProgress({catalogueName: tutorials[i].catalogueName})
            .then(res => {
                if (res?.status === 0 && res.data.data) {
                    const data = res.data.data;
                    let sum = 0;
                    data.forEach(element => {
                        element.is_finish && sum++
                    });
                    tutorials[i].progress = (sum / data.length * 100).toFixed(0)
                }
            })
        }
        setTutorials([...tutorials]);
    }

    function init(params) {
        const host = window.location.origin;
        axios.get(`${host}/tutorial/tutorials.json`)
        .then(res => {
            tutorials = res.data;
            setTutorials([...tutorials]);
        })
        .catch(err => {
            console.log(err);
        })
    }

    useEffect(() => {
        init();
    },[])

    useEffect(() => {
        address && getProgress()
    },[address])

    return (
        <div className="Lesson">
            <div className="custom-bg-round" />
            <p className="title">{t("header.lesson")}</p>
            <div className="content">
                {
                    tutorials.map(e => 
                        <a 
                            href={`https://decert.me/tutorial/${e.catalogueName}${/^README$/i.test(e.startPage) ? "/" : "/"+e.startPage}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            key={e.catalogueName}
                        >
                            <div className="box">
                                <div className="img">
                                    <img src={e?.img?.indexOf("http") === -1 ? require(`@/${e.img}`) : e.img} alt="" />
                                </div>
                                <div className="box-content">
                                    <p className="box-title">
                                        {e.label}
                                    </p>
                                    <p className="box-desc">
                                        {e?.desc}
                                    </p>
                                </div>
                                {
                                    e?.progress &&
                                    <div className="progress">
                                        {t("progress")} {e.progress}%
                                    </div>
                                }
                            </div>
                        </a>
                    )
                }
            </div>
        </div>
    )
}