import { getChallengers, getCollectionChallenger } from "@/request/api/quests"
import { avatar } from "@/utils/user";
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
    DownOutlined
} from '@ant-design/icons';


export default function CollectionChallenger({id}) {
    
    const pageSize = 15;
    const { t } = useTranslation(["explore"]);
    const [page, setPage] = useState(0);
    const [isOver, setIsOver] = useState();
    let [detail, setDetail] = useState();
    let [challengers, setChallengers] = useState([]);

    async function init(params) {
        setPage(page+1);
        getCollectionChallenger({id: id, page, pageSize})
        .then(res => {
            detail = res?.data;
            setDetail(detail);
            challengers = challengers.concat(detail.users);
            setChallengers([...challengers]);
            if (detail.users.length !== pageSize) {
                setIsOver(true)
            }
        })
    }

    useEffect(() => {
        init();
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
                        challengers.map((e,i) => 
                            <li key={i}>
                                <Link to={`/${e.address}`}>
                                    <img src={avatar(e)} alt="" />
                                </Link>
                            </li>
                        )
                    }
                    {
                        !isOver &&
                        <DownOutlined className="arrow" onClick={init} />
                    }
                </ul>
            </div>
        </div>
    )
}