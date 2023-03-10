import { useEffect, useRef, useState } from "react"
import { Col, Row, Button, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import InfiniteScroll from 'react-infinite-scroll-component';
import { getQuests } from "../request/api/public"
import { LazyLoadImage } from 'react-lazy-load-image-component';
import "@/assets/styles/view-style/explore.scss"
import { useRequest } from "ahooks";
import { useAccount } from "wagmi";

export default function Explore(params) {
    

    const { address } = useAccount();
    const navigateTo = useNavigate();
    let [isOver, setIsOver] = useState();
    const ref = useRef(null);
    let [challenges, setChallenges] = useState([]);
    let [pageConfig, setPageConfig] = useState({
        page: 1, pageSize: 10, total: 0
    });

    const goChallenge = (item) => {
        if (address && item.claimed) {
            navigateTo(`/claim/${item.tokenId}`);
        }else{
            navigateTo(`/quests/${item.tokenId}`);
        }
    }

    const getNext = () => {
        if (pageConfig.total === 0 || (pageConfig.page-1) * pageConfig.pageSize <= pageConfig.total) {
            getQuests(pageConfig)
            .then(res => {
                setIsOver(true);
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

    const { run } = useRequest(getNext, {
        debounceWait: 500,
        manual: true
    });

    const handleResize = () => {
        // 重新计算组件高度和滚动位置等信息
        const node = ref.current;

        const scrollHeight = node.scrollHeight;
        const clientHeight = node.clientHeight;
        const scrollTop = node.scrollTop;
        const isAtBottom = scrollHeight - (clientHeight + scrollTop) < 10;
        if (isAtBottom) {
            run();
        }
    };

    useEffect(() => {
        // 添加窗口缩放事件监听器
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        window.scrollTo(0,0);
        run()
    },[])


    return (
        <div className="Explore">
            {/* title */}
            <h3>探索挑战</h3>
            {/* Challenge */}
            <div className="challenges">
                <InfiniteScroll
                    dataLength={challenges.length}
                    next={run}
                    hasMore={true}
                    ref={ref}
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
                </InfiniteScroll>

            
            </div>
        </div>
    )
}