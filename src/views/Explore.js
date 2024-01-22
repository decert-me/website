import { useEffect, useState } from "react"
import { getQuests } from "../request/api/public"
import "@/assets/styles/view-style/explore.scss"
import "@/assets/styles/mobile/view-style/explore.scss"
import { useTranslation } from "react-i18next";
import store from "@/redux/store";
import ChallengeItem from "@/components/User/ChallengeItem";
import ChallengeItems from "@/components/User/ChallengeItems";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getCollectionQuest } from "@/request/api/quests";
import {
    ArrowLeftOutlined,
  } from '@ant-design/icons';
import InfiniteScroll from "react-infinite-scroll-component";
import { Spin } from "antd";

export default function Explore(params) {
    
    const { t } = useTranslation(["explore", "translation"]);
    const { id } = useParams();
    const location = useLocation();
    const navigateTo = useNavigate();
    
    let [page, setPage] = useState(0);
    
    let [isOver, setIsOver] = useState();
    let [challenges, setChallenges] = useState([]);
    let [isMobile, setIsMobile] = useState(store.getState().isMobile);
    let [loading, setLoading] = useState(false);

    function handleMobileChange() {
        isMobile = store.getState().isMobile;
        setIsMobile(isMobile);
    }

    store.subscribe(handleMobileChange);
    
    const goCollection = (id) => {
        navigateTo(`/collection/${id}`)
    }

    const getChallenge = async() => {
        if (loading) {
            return
        }
        setLoading(true);
        const cache = localStorage.getItem("decert.cache");

        page += 1;
        setPage(page);
        let res
        if (id) {
            res = await getCollectionQuest({id: Number(id)});
        }else{
            res = await getQuests({pageSize: 10, page: page});
        }
        challenges = challenges.concat(res.data.list);
        if (challenges.length === res.data.total || id) {
            setIsOver(true);
        }
        if (cache) {
            const claimable = JSON.parse(cache)?.claimable;
            if (claimable && claimable.length > 0) {
                challenges.map(e => {
                    claimable.map((ele,index) => {
                        if (e.uuid == ele.uuid && e.claimed) {
                            const newCache = JSON.parse(cache);
                            newCache.claimable.splice(index,1);
                            localStorage.setItem("decert.cache", JSON.stringify(newCache));
                        }else if (e.uuid == ele.uuid) {
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
        challenges = [];
        setChallenges([...challenges]);
        page = 0;
        setPage(page);
        isOver = false;
        setIsOver(isOver);
        getChallenge()
    },[location])

    return (
        <div className="Explore" key={location.pathname}>
            <div className="custom-bg-round"></div>
            {
                id && 
                <div className="back" onClick={() => navigateTo("/challenges")}>
                    <ArrowLeftOutlined />
                    <p>返回</p>
                </div>
            }
            {/* title */}
            <h3>{t("title")}</h3>
            {/* Challenge */}
            <InfiniteScroll
                className="challenges"
                dataLength={challenges.length}
                next={getChallenge}
                hasMore={challenges.length !== 0 && !isOver}
                loader={<Spin size="large" className="loading" />}
            >
                {
                    challenges.map(item => (
                        item.style === 1 ?
                        <ChallengeItem
                            key={item.id} 
                            info={item}
                        />
                        :
                        <ChallengeItems 
                            key={item.id} 
                            info={item}
                            goCollection={goCollection}
                        />
                    ))
                }
            </InfiniteScroll>
        </div>
    )
}