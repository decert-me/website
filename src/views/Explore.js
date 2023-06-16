import { useEffect, useRef, useState } from "react"
import { ClockCircleFilled } from '@ant-design/icons';
import { Rate } from "antd";
import { useNavigate } from "react-router-dom";
import { getQuests } from "../request/api/public"
import { LazyLoadImage } from 'react-lazy-load-image-component';
import "@/assets/styles/view-style/explore.scss"
import "@/assets/styles/mobile/view-style/explore.scss"
import { useTranslation } from "react-i18next";
import { constans } from "@/utils/constans";
import store from "@/redux/store";
import InfiniteScroll from "@/components/InfiniteScroll";
import { convertTime } from "@/utils/convert";

export default function Explore(params) {
    
    const { t } = useTranslation(["explore", "translation"]);
    const navigateTo = useNavigate();
    const { ipfsPath, defaultImg } = constans();
    const scrollRef = useRef(null);
    
    let [page, setPage] = useState(0);
    const loader = useRef(null);
    
    let [isOver, setIsOver] = useState();
    let [challenges, setChallenges] = useState([]);
    let [isMobile, setIsMobile] = useState(store.getState().isMobile);

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
    }

    function getTimeDiff(time) {
        var now = new Date();
        var dbTime = new Date(time);
        var timeDiff = Math.round(now - dbTime) / 1000;
        const { type, time: num } = convertTime(timeDiff, "all")

        return (
            <>
                {t(`translation:${type}`, {time: Math.round(num)})}
            </>
        )
    }

    useEffect(() => {
        // isInViewPortOfThree()
        getChallenge()
    }, []);

    return (
        <div className="Explore">
            <div className="custom-bg-round"></div>
            {/* title */}
            <h3>{t("title")}</h3>
            {/* Challenge */}
            <div className="challenges" ref={scrollRef}>
                    {
                        challenges.map(item => (
                            <div 
                                key={item.id}
                                className="challenge-item"
                                onClick={() => goChallenge(item)}
                            >
                                {
                                    item.claimed &&
                                    <div className="item-claimed">
                                        {t("pass")}
                                    </div>
                                }
                                {
                                    item?.claimable && 
                                    <div className="item-claimable">
                                        {t("claimable")}
                                    </div>
                                }
                                <div className="right-sbt">
                                    <div className="img">
                                        <LazyLoadImage
                                            src={
                                                item.metadata.image?.split("//")[1]
                                                    ? `${ipfsPath}/${item.metadata.image.split("//")[1]}`
                                                    : defaultImg
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="left-info">
                                    <div>
                                        <p className="title newline-omitted">
                                            {item.title}
                                        </p>
                                        <p className="desc newline-omitted">
                                            {item.metadata.description}
                                        </p>
                                    </div>
                                    <div className="sbt-detail">
                                        <div>
                                            <span className="mr12">{t("translation:diff")}</span>
                                            <Rate disabled defaultValue={item.metadata?.attributes?.difficulty + 1} count={3} />
                                        </div>
                                        <div className="time">
                                            <ClockCircleFilled />
                                            {getTimeDiff(item?.quest_data?.startTime)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    }

                {
                        !isOver &&
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