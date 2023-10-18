import { getChallengers, getCollectionChallenger } from "@/request/api/quests"
import { avatar } from "@/utils/user";
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
    DownOutlined
} from '@ant-design/icons';


export default function CollectionChallenger({id}) {
    
    let [detail, setDetail] = useState();
    const { t } = useTranslation(["explore"]);
    const [page, setPage] = useState(0);
    let [challengers, setChallengers] = useState([]);

    async function init(params) {
        setPage(page+1);
        getCollectionChallenger({id: id, page, pageSize: 15})
        .then(res => {
            detail = res?.data;
            setDetail(detail);
            challengers = challengers.concat(detail.users);
            setChallengers([...challengers]);
            console.log(challengers);
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
                    <DownOutlined className="arrow" onClick={init} />
                </ul>
            </div>
        </div>
    )
}