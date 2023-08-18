import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom";
import { getQuests } from "../request/api/public"
import "@/assets/styles/view-style/explore.scss"
import "@/assets/styles/mobile/view-style/explore.scss"
import { useTranslation } from "react-i18next";
import store from "@/redux/store";
import InfiniteScroll from "@/components/InfiniteScroll";
import ChallengeItem from "@/components/User/ChallengeItem";

export default function Explore(params) {
    
    const { t } = useTranslation(["explore", "translation"]);
    const navigateTo = useNavigate();
    const scrollRef = useRef(null);
    
    let [page, setPage] = useState(0);
    const loader = useRef(null);
    
    let [isOver, setIsOver] = useState();
    let [challenges, setChallenges] = useState([]);
    let [isMobile, setIsMobile] = useState(store.getState().isMobile);
    let [loading, setLoading] = useState(false);

    function handleMobileChange() {
        isMobile = store.getState().isMobile;
        setIsMobile(isMobile);
    }

    store.subscribe(handleMobileChange);
    
    const goChallenge = (item) => {
        if (item.claimed || item.claimable) {
            navigateTo(`/claim/${item.tokenId}`);
        }else{
            navigateTo(`/quests/${item.tokenId}`);
        }
    }

    const getChallenge = async() => {
        if (loading) {
            return
        }
        setLoading(true);
        const cache = localStorage.getItem("decert.cache");
        page += 1;
        setPage(page);
        const res = await getQuests({pageSize: 10, page: page});
        if (res.data.list.length !== 10) {
            setIsOver(true);
        }
        challenges = challenges.concat(res.data.list);
        if (cache) {
            const claimable = JSON.parse(cache)?.claimable;
            if (claimable && claimable.length > 0) {
                challenges.map(e => {
                    claimable.map((ele,index) => {
                        if (e.tokenId == ele.token_id && e.claimed) {
                            const newCache = JSON.parse(cache);
                            newCache.claimable.splice(index,1);
                            localStorage.setItem("decert.cache", JSON.stringify(newCache));
                        }else if (e.tokenId == ele.token_id) {
                            e.claimable = true;
                        }
                    })
                })
            }
        }
        setChallenges([...challenges]);
        setLoading(false);
    }

    useEffect(() => {
        getChallenge()
    },[])

    return (
        <div className="Explore">
            <div className="custom-bg-round"></div>
            {/* title */}
            <h3>{t("title")}</h3>
            {/* Challenge */}
            <div className="challenges" ref={scrollRef}>
                    {
                        challenges.map(item => (
                            <ChallengeItem
                                key={item.id} 
                                info={item}
                            />
                        ))
                    }

                {
                        challenges.length !== 0 && !isOver &&
                        <div ref={loader}>
                            {/* <Spin size="large" className="loading" /> */}
                            <InfiniteScroll
                                scrollRef={scrollRef}
                                func={getChallenge}
                            />
                        </div>
                    }
                
            </div>
        </div>
    )
}