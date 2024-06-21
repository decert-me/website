import { useEffect, useRef, useState } from "react"
import { getQuests } from "../request/api/public"
import "@/assets/styles/view-style/explore.scss"
import "@/assets/styles/mobile/view-style/explore.scss"
import { useTranslation } from "react-i18next";
import { SearchOutlined } from '@ant-design/icons';
import store from "@/redux/store";
import ChallengeItem from "@/components/User/ChallengeItem";
import ChallengeItems from "@/components/User/ChallengeItems";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getCollectionQuest } from "@/request/api/quests";
import {
    ArrowLeftOutlined,
  } from '@ant-design/icons';
import InfiniteScroll from "react-infinite-scroll-component";
import { Input, Spin } from "antd";
import { useRequest, useUpdateEffect } from "ahooks";
import { getLabelList } from "@/request/api/admin";
import CustomCategory from "@/components/CustomCategory";

export default function Explore(params) {
    
    const { t } = useTranslation(["explore", "translation"]);
    const { id } = useParams();
    const location = useLocation();
    const navigateTo = useNavigate();

    const childRef = useRef(null);
    const [total, setTotal] = useState(0);
    const [category, setCategory] = useState([]);
    let [searchInner, setSearchInner] = useState("");
    let [sidebar, setSidebar] = useState([]);     //  所选语种标签
    let [selectItems, setSelectItems] = useState([[],[],[]]);   //  当前选中的类别
    
    let [page, setPage] = useState(0);
    
    let [isOver, setIsOver] = useState();
    let [challenges, setChallenges] = useState([]);
    let [isMobile, setIsMobile] = useState(store.getState().isMobile);
    let [loading, setLoading] = useState(false);

    const { run: debounceSearch } = useRequest(changeSearch, {
        debounceWait: 500,
        manual: true,
    });

    // 获取当前选中的 *类别* 列表
    function changeSelectItems(items, index) {
        selectItems[index] = items;
        setSelectItems([...selectItems]);
        const list = items.map(e => {
            return e.ID
        })
        setCategory([...list]);
    }

    function changeSearch(event) {
        searchInner = event.target.value;
        setSearchInner(searchInner);
    }

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
            res = await getQuests({pageSize: 10, page: page, category, search_key: searchInner});
        }
        challenges = challenges.concat(res.data.list || []);
        if (challenges.length === res.data.total || id) {
            setIsOver(true);
        }
        setTotal(res.data.total);
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

    async function init(params) {
        await getLabelList({type: "category"})
        .then(res => {
            if (res.status === 0) {
                const list = res.data || [];
                sidebar = [{label: "type", list: list}]; 
                setSidebar([...sidebar]);
            }
        })
    }

    useEffect(() => {
        location.pathname === "/challenges" && init();
    },[location])

    useEffect(() => {
        challenges = [];
        setChallenges([...challenges]);
        page = 0;
        setPage(page);
        isOver = false;
        setIsOver(isOver);
        getChallenge()
    },[location])

    useUpdateEffect(() => {
        page = 0;
        setPage(page);
        challenges = [];
        setChallenges([...challenges]);
        getChallenge();
    },[selectItems, searchInner])

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
            <div className="search">
                <Input size="large" prefix={<SearchOutlined />} onChange={debounceSearch} />
            </div>
            <div className="selectList">
                {
                    sidebar.map((item, i) => 
                        <div className="sidebar-item" key={item.label}>
                            <CustomCategory
                                items={item.list} 
                                label={item.label}
                                changeSelectItems={(e) => changeSelectItems(e, i)} 
                                allSelectItems={selectItems}
                                sidebarIndex={i}
                                ref={childRef}
                            />
                        </div>
                    )
                }
            </div>
            <p className="content-subtitle">{t("btn-challenge")}({total})</p>

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