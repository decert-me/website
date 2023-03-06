import { useEffect, useState } from "react"
import { Col, Row, Button, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import InfiniteScroll from 'react-infinite-scroll-component';
import { getQuests } from "../request/api/public"
import { LazyLoadImage } from 'react-lazy-load-image-component';
import "@/assets/styles/view-style/explore.scss"

export default function Explore(params) {
    

    const navigateTo = useNavigate();
    let [isOver, setIsOver] = useState();
    let [challenges, setChallenges] = useState([]);
    let [pageConfig, setPageConfig] = useState({
        page: 1, pageSize: 10, total: 0
    });



    useEffect(() => {
        window.scrollTo(0,0);
        getNext()
    },[])

    const getNext = () => {
        if (pageConfig.total === 0 || (pageConfig.page-1) * pageConfig.pageSize <= pageConfig.total) {
            getQuests(pageConfig)
            .then(res => {
                if (res.data.list.length === 0) {
                    setIsOver(true);
                }
                challenges = challenges.concat(res.data.list);
                setChallenges([...challenges]);
                if (pageConfig.total === 0) {
                    pageConfig.total = res.data.total;
                }
                pageConfig.page += 1;
                setPageConfig({...pageConfig})
            })
        }else{
            setIsOver(true);
        }
    }

    return (
        <div className="Explore">
            {/* title */}
            <h3>探索挑战</h3>
            {/* Challenge */}
            <div className="challenges">
                <InfiniteScroll
                    dataLength={challenges.length}
                    next={getNext}
                    hasMore={true}
                    style={{
                        position: "relative",
                        overflow: "visible"
                    }}
                    loader={
                        isOver ? '' :
                        <div style={{
                            position: "absolute",
                            left: 'calc((100% - 32px) / 2)',
                            marginTop: "40px"
                        }}>
                            <Spin size="large" />
                        </div>
                        
                    }
                >
                    <Row gutter={18} style={{margin: 0}}>
                        {
                            challenges.map(item => (
                            <Col span={12} key={item.id}>
                                <div className="challenge-item">
                                    <div className="left-info">
                                    <div className="title">{item.title}</div>
                                    <p>{item.describe}</p>
                                    <Button
                                        onClick={() => {
                                            navigateTo(`/quests/${item.tokenId}`);
                                        }}
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
                </InfiniteScroll>

            
            </div>
        </div>
    )
}