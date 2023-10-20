import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getQuests, shareClick } from "../../request/api/public";
import "@/assets/styles/view-style/question.scss"
import "@/assets/styles/mobile/view-style/question.scss"
import { constans } from "@/utils/constans";
import Challenger from "./Challenger";
import Info from "./Info";
import { setMetadata } from "@/utils/getMetadata";


export default function Quests(params) {
    
    const { ipfsPath, defaultImg } = constans();
    const location = useLocation();
    const navigateTo = useNavigate();
    let [detail, setDetail] = useState();
    const { questId } = useParams();

    const getData = async (id) => {
        try {
            const res = await getQuests({id: id});
            setMetadata(res.data)
            .then(res => {
                detail = res ? res : {};
                setDetail({...detail});
            })
        } catch (error) {
            navigateTo("/404")
        }
    }

    useEffect(() => {
        questId && getData(questId);
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get("code");
        code && shareClick({share_code: code})
    }, []);

    return (
        detail &&
        <div className="Question">
            <div className="custom-bg-round"></div>
            <h1>{detail.title}</h1>
            <div className="content">
                <div className="content-left">
                    <div className="quest-title">
                        <div className="img challenge-img">
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