import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getQuests, shareClick } from "../../request/api/public";
import "@/assets/styles/view-style/question.scss"
import "@/assets/styles/mobile/view-style/question.scss"
import { setMetadata } from "@/utils/getMetadata";
import Content from "./Content";


export default function Quests(params) {
    


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
        detail && <Content detail={detail} questId={questId} />
    )
}