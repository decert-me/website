import { useEffect, useRef, useState } from "react"
import { Col, Row, Button, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import InfiniteScroll from 'react-infinite-scroll-component';
import { getQuests } from "../request/api/public"
import { LazyLoadImage } from 'react-lazy-load-image-component';
import "@/assets/styles/view-style/explore.scss"
import { useUpdateEffect } from "ahooks";
import { useAccount } from "wagmi";

export default function Explore(params) {
    

    const { address } = useAccount();
    const navigateTo = useNavigate();
    
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
            console.log(ioe);
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

    return (
        <div className="Explore">
            {/* title */}
            <h3>探索挑战</h3>
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
                                    挑战
                                </Button>
                                </div>
                                <div className="right-sbt">

                                <LazyLoadImage
                                    src={
                                        item.metadata.image.split("//")[1]
                                            ? `http://ipfs.learnblockchain.cn/${item.metadata.image.split("//")[1]}`
                                            : 'assets/images/img/default.png'
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