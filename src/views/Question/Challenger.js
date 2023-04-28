import { getChallengers } from "@/request/api/quests"
import { avatar } from "@/utils/user";
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function Challenger(props) {
    
    const { questId } = props;
    let [detail, setDetail] = useState();
    const { t } = useTranslation(["explore"]);

    async function init(params) {
        getChallengers({questId: questId})
        .then(res => {
            detail = res?.data;
            setDetail(detail);
        })
    }

    useEffect(() => {
        questId && init();
    },[])

    return (
        detail &&
        <div className="quest-challenger">
            <div className="title">
                {t("challenger")}
                <span>{detail.Times}</span>
            </div>
            <div className="list">
                <ul>
                    {
                        detail.users.map((e,i) => 
                            <li key={i}>
                                <Link to={`/${e.address}`}>
                                    <img src={avatar(e)} alt="" />
                                </Link>
                            </li>
                        )
                    }
                </ul>
            </div>
        </div>
    )
}