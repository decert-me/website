import { useParams } from "react-router-dom"
import CollectionInfo from "./detail";
import "./index.scss";
import { useEffect, useState } from "react";
import { getCollectionQuest } from "@/request/api/quests";
import { constans } from "@/utils/constans";
import { Button } from "antd";

export default function Collection(params) {
    
    const { id } = useParams();
    const { ipfsPath, defaultImg } = constans();
    let [detail, setDetail] = useState();
    let [quests, setQuests] = useState();

    async function init() {
        const res = await getCollectionQuest({id: Number(id)});
        console.log(res);
        detail = res.data;
        setDetail({...detail});
    }

    useEffect(() => {
        init();
    },[])

    return (
        detail &&
        <div className="Collection">
            <div className="custom-bg-round"></div>
            <div className="question-content">
                <div className="question-left">
                    {/* 挑战列表 */}
                    <CollectionInfo detail={detail} />
                </div>
                <div className="question-right">
                    <div className="nft">
                        <div className="img">
                            <img 
                                src={
                                    detail.collection.cover
                                    ? `${ipfsPath}/${detail.collection.cover}`
                                    : defaultImg
                                }
                                alt="" />
                        </div>
                        {/* <div className="status">
                            {detail.quest_data?.status === "updating" ? "未完结" : "完结"}
                        </div> */}
                    </div>
                    <Button className="btn-claim">领取</Button>
                    {/* <CollectionChallenger questId={questId} /> */}
                </div>
            </div>
        </div>
    )
}