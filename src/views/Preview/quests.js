import { useEffect, useState } from "react";
import Content from "../Question/Content";
import { useLocation } from "react-router-dom";
import { getDataBase } from "@/utils/saveCache";
import store from "@/redux/store";
import { useAccount } from "wagmi";




export default function PreviewQuest(params) {

    const location = useLocation();
    const { address } = useAccount();
    let [detail, setDetail] = useState();
    let [questId, setQuestId] = useState();
    

    async function init() {
        const tokenId = location.search.replace("?","");
        setQuestId(tokenId);
        let data;
        if (tokenId) {
            const { challenge } = await store.getState();
            data = [challenge]
        }else{
            data = await getDataBase("publish");
        }
        const cache = data[0];
        const {desc, difficulty, editor, fileList, time, title} = cache;
        const image = "ipfs://"+fileList[0]?.response.data.hash || null;
        detail = {
            title,
            version: "2",
            creator: address,
            recommend: editor,
            description: desc,
            preview: true,
            metadata: {
                image,
                properties: {
                    estimateTime: time,
                    difficulty: difficulty
                }
            }
        }
        setDetail({...detail});
    }

    useEffect(() => {
        init();
    },[])
    
    return (
        detail && <Content detail={detail} questId={questId} />
    )
}