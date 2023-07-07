import "@/assets/styles/view-style/lesson.scss"
import "@/assets/styles/mobile/view-style/lesson.scss"
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Lesson(params) {
    
    const { t } = useTranslation();
    let [tutorials, setTutorials] = useState([]);

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

    return (
        <div className="Lesson">
            <div className="custom-bg-round" />
            <p className="title">{t("header.lesson")}</p>
            <div className="content">
                {
                    tutorials.map(e => 
                        <a 
                            href={`https://decert.me/tutorial/${e.catalogueName}/${e.startPage}`} 
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
                            </div>
                        </a>
                    )
                }
            </div>
        </div>
    )
}