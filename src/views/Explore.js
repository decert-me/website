import { useEffect, useRef, useState } from "react"
import { Col, Row, Button, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { getQuests } from "../request/api/public"
import { LazyLoadImage } from 'react-lazy-load-image-component';
import "@/assets/styles/view-style/explore.scss"
import "@/assets/styles/mobile/view-style/explore.scss"
import { useAccount } from "wagmi";
import { useTranslation } from "react-i18next";
import { constans } from "@/utils/constans";
import store from "@/redux/store";
import InfiniteScroll from "@/components/InfiniteScroll";

export default function Explore(params) {
    
    const { t } = useTranslation(["explore"]);
    const { address } = useAccount();
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
            if (claimable) {
                challenges.map(e => {
                    claimable.map(ele => {
                        if (e.tokenId == ele) {
                            e.claimable = true;
                        }
                    })
                })
            }
        }
        setChallenges([...challenges]);
    }

    // const io = new IntersectionObserver(ioes => {
    //     ioes.forEach(async(ioe) => {
    //         const el = ioe.target
    //         const intersectionRatio = ioe.intersectionRatio
    //         if (intersectionRatio > 0 && intersectionRatio <= 1) {
    //             await getChallenge()
    //             io.unobserve(el)
    //         }
    //         if (!isOver) {
    //             isInViewPortOfThree()
    //         }
    //     })
    // })

    // 执行交叉观察器
    // function isInViewPortOfThree () {
    //     io.observe(document.querySelector(".loading"))
    // }

    useEffect(() => {
        // isInViewPortOfThree()
        getChallenge()
    }, []);

    return (
        <div className="Explore">
            {/* title */}
            <h3>{t("title")}</h3>
            {/* Challenge */}
            <div className="challenges" ref={scrollRef}>
                <Row gutter={18} style={{margin: 0}}>
                    {
                        challenges.map(item => (
                        <Col span={isMobile ? 24 : 12} key={item.id}>
                            <div className="challenge-item">
                                <div className="left-info">
                                <div className="title">{item.title}</div>
                                <p className="desc">{item.description}</p>
                                <Button
                                    onClick={() => goChallenge(item)}
                                    className="btn"
                                >
                                    {t("btn-challenge")}
                                </Button>
                                </div>
                                <div className="right-sbt">
                                    <div className="img">
                                        <LazyLoadImage
                                            src={
                                                item.metadata.image?.split("//")[1]
                                                    ? `${ipfsPath}/${item.metadata.image.split("//")[1]}`
                                                    : defaultImg
                                            }
                                        />
                                        {
                                            item.claimed &&
                                            <div className="item-claimed">
                                                pass
                                            </div>
                                        }
                                        {
                                            item?.claimable && 
                                            <div className="item-claimable">
                                                claimable
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </Col>
                        ))
                    }
                </Row>

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