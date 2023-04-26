import { getChallengers } from "@/request/api/quests"
import { avatar } from "@/utils/user";
import { useEffect, useState } from "react"

export default function Challenger(props) {
    
    const { questId } = props;
    let [detail, setDetail] = useState();

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
                挑战者
                <span>{detail.Times}</span>
            </div>
            <div className="list">
                <ul>
                    {
                        detail.users.map((e,i) => 
                            <li key={i}>
                                <img src={avatar(e)} alt="" />
                            </li>
                        )
                    }
                </ul>
            </div>
        </div>
    )
}