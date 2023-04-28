import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getQuests } from "../../request/api/public";
import "@/assets/styles/view-style/question.scss"
import "@/assets/styles/mobile/view-style/question.scss"
import { constans } from "@/utils/constans";
import Challenger from "./Challenger";
import Info from "./Info";


export default function Quests(params) {
    
    const { ipfsPath, defaultImg } = constans();
    let [detail, setDetail] = useState();
    const { questId } = useParams();

    const getData = (id) => {
        getQuests({id: id})
        .then(res => {
            detail = res ? res.data : {};
            setDetail({...detail});
        })
    }

    useEffect(() => {
        questId && getData(questId);
    }, []);

    return (
        detail &&
        <div className="Question">
            <h1>{detail.title}</h1>
            <div className="content">
                <div className="content-left">
                    <div className="quest-title">
                        <div className="img">
                            <img 
                                src={
                                    detail.metadata.image.split("//")[1]
                                    ? `${ipfsPath}/${detail.metadata.image.split("//")[1]}`
                                    : defaultImg
                                }
                                alt="" />
                        </div>
                    </div>
                    <Challenger questId={questId} />
                </div>
                <div className="content-right">
                    <Info detail={detail}/>
                </div>
            </div>
        </div>
    )
}