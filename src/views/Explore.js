import { useEffect, useRef, useState } from "react"
import { Col, Row, Button, Spin } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { getQuests } from "../request/api/public"
import { LazyLoadImage } from 'react-lazy-load-image-component';
import "@/assets/styles/view-style/explore.scss"
import { useAccount } from "wagmi";
import { useTranslation } from "react-i18next";
import { constans } from "@/utils/constans";

export default function Explore(params) {
    
    const { t } = useTranslation(["explore"]);
    const { address } = useAccount();
    const location = useLocation();
    const navigateTo = useNavigate();
    const { ipfsPath, defaultImg } = constans();
    
    let [page, setPage] = useState(0);
    const loader = useRef(null);
    
    let [isOver, setIsOver] = useState();
    let [challenges, setChallenges] = useState([]);
    
    const goChallenge = (item) => {
        if (address && item.claimed) {
            navigateTo(`/claim/${item.tokenId}`);
        }else{
            navigateTo(`/quests/${item.tokenId}`);
        }
    }

    const getChallenge = async() => {
            page += 1;
            setPage(page);
            const res = await getQuests({pageSize: 10, page: page});
            if (res.data.list.length !== 10) {
                setIsOver(true);
            }
            challenges = challenges.concat(res.data.list);
            setChallenges([...challenges]);

    }

    const io = new IntersectionObserver(ioes => {
        ioes.forEach(async(ioe) => {
            const el = ioe.target
            const intersectionRatio = ioe.intersectionRatio
            if (intersectionRatio > 0 && intersectionRatio <= 1) {
                await getChallenge()
                io.unobserve(el)
            }
            if (!isOver) {
                isInViewPortOfThree()
            }
        })
    })

    // 执行交叉观察器
    function isInViewPortOfThree () {
        io.observe(document.querySelector(".loading"))
    }

    useEffect(() => {
        isInViewPortOfThree()
        
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
        console.log('xxx');
    },[location])

    return (
        <div className="Explore">
            {/* title */}
            <h3>{t("title")}</h3>
            {/* Challenge */}
            <div className="challenges">
                <Row gutter={18} style={{margin: 0}}>
                    {
                        challenges.map(item => (
                        <Col span={12} key={item.id}>
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

                                <LazyLoadImage
                                    src={
                                        item.metadata.image.split("//")[1]
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
                                </div>
                            </div>
                        </Col>
                        ))
                    }
                </Row>

                {
                        !isOver &&
                        <div ref={loader}>
                            <Spin size="large" className="loading" />
                        </div>
                    }
                
            </div>
        </div>
    )
}