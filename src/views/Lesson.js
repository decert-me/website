import "@/assets/styles/view-style/lesson.scss"
import "@/assets/styles/mobile/view-style/lesson.scss"
import { useTranslation } from "react-i18next";
import { useContext, useEffect, useRef, useState } from "react";
import { progressList } from "@/request/api/public";
import { Button, Divider, Drawer, Input, Spin } from "antd";
import { SearchOutlined } from '@ant-design/icons';
import CustomCategory from "@/components/CustomCategory";
import MyContext from "@/provider/context";
import { useRequest, useUpdateEffect } from "ahooks";
import { totalTime } from "@/utils/date";
import { getLabelList, getTutorialList } from "@/request/api/admin";
import i18n from 'i18next';
import { useAddress } from "@/hooks/useAddress";
import InfiniteScroll from "react-infinite-scroll-component";

function Difficulty({tutorial, label}) {
    let color = "";

    switch (tutorial.difficulty) {
        case 0:
            color = "#FFB21E";
            break;
        case 1:
            color = "#5887E1";
            break;
        case 2:
        default:
            color = "#EB1C1C";
            break;
    }
    
    return (
        <>
        <div className="point" style={{backgroundColor: color}}></div>{label}
        </>
    )
}

function GetTags({ tutorial, tags }) {
    const arr = [];
    tutorial?.category &&
    tutorial.category.forEach(ele => {
        // 获取ele的中英文
        arr.push(tags.filter(e => e.ID === ele)[0])
    })
    return (
        arr.map((item,index) => 
            <li className="tag" key={index}>
                {i18n.language === "zh-CN" ? item.Chinese : item.English}
            </li>
        )
    )
}

// function SelectItems({selectItems: items, removeItem, removeAllItems, sidebarIsOpen, changeSidebar, t}) {
//     const result = [];
//     for (let i = 0; i < items.length; i++) {
//         const element = items[i];
//         element.forEach(item => {
//             result.push({
//                 ...item, 
//                 index: i
//             })
//         })
//     }
//     return (
//         (result.length !== 0 || !sidebarIsOpen) &&
//         <div className="selectItems">
//             {
//                 !sidebarIsOpen &&
//                 <div className="icon" onClick={() => changeSidebar()}>
//                     <img src={require("@/assets/images/icon/icon-filter.png")} alt="" />
//                 </div>
//             }
//             {
//                 result.map((item) => 
//                     <div 
//                         className="selectItem" 
//                         key={item.ID}
//                         onClick={() => removeItem(item.key, item.index)}
//                     >
//                         {i18n.language === "zh-CN" ? item.Chinese : item.English} <img src={require("@/assets/images/icon/icon-close.png")} alt="" />
//                     </div>
//                 )
//             }
//             {
//                 result.length !== 0 &&
//                     <div className="selectItem" onClick={() => removeAllItems()}>
//                         {t("tutorial.clear")}
//                     </div>
//             }
//         </div>
//     )
// }

export default function Lesson(params) {
    
    const contentRef = useRef(null);
    const sidebarRef = useRef(null);
    const listRef = useRef(null);
    const childRef = useRef(null);
    
    const { t } = useTranslation();
    const { address } = useAddress();
    const [total, setTotal] = useState(0);
    let [searchInner, setSearchInner] = useState("");
    let [tutorials, setTutorials] = useState([]);   //  教程列表
    
    let [isOk, setIsOk] = useState(false);   //  dom操作是否完成
    let [selectItems, setSelectItems] = useState([[],[],[]]);   //  当前选中的类别
    let [tags, setTags] = useState([]);     //  所选标签
    let [sidebar, setSidebar] = useState([]);     //  所选语种标签

    let [isOver, setIsOver] = useState();   //  无限滚动
    let [pageConfig, setPageConfig] = useState({
        page: 1, pageSize: 20
    });   //  分页配置

    const { run: debounceSearch } = useRequest(changeSearch, {
        debounceWait: 500,
        manual: true,
    });
    
    const { run } = useRequest(resizeContent, {
        debounceWait: 300,
        manual: true,
    });

    const { run: runAdd } = useRequest(addClassName, {
        throttleWait: 300,
        manual: true,
    });

    const { run: runRemove } = useRequest(removeClassName, {
        debounceWait: 500,
        manual: true,
    });

    // 侧边栏删除类名
    function removeClassName() {
        sidebarRef.current.classList.remove("content-sidebar-scrollbar")
    }

    // 侧边栏添加类名
    function addClassName() {
        sidebarRef.current.classList.add("content-sidebar-scrollbar")
        runRemove()
    }

    // 获取当前选中的 *类别* 列表
    function changeSelectItems(items, index) {
        selectItems[index] = items;
        setSelectItems([...selectItems]);
    }

    // 页面滑动出content区域侧边栏高度改变
    function scrollSidebar() {
        if (listRef.current && sidebarRef.current) {
            const elementRect = contentRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
            if (elementRect.bottom <= viewportHeight) {
                sidebarRef.current.style.position = "absolute";
                sidebarRef.current.style.top = "auto";
                sidebarRef.current.style.bottom = 0;
            }else{
                sidebarRef.current.style.position = "fixed";
                sidebarRef.current.style.top = "82px";
            }
        }
    }

    // 动态调整教程宽度
    function resizeContent() {
        const boxsRef = document.querySelectorAll(".boxs")[0];
        if (boxsRef) {
            const domArr = document.querySelectorAll(".boxs .box-link");
            const imgArr = document.querySelectorAll(".boxs .box-link .img");

            const contentWidth = boxsRef.getBoundingClientRect().width;
            const num = parseInt(contentWidth / 350);
            let value;
            // 如果够展开
            if ((((num - 1) * 20) + (350 * num)) <= contentWidth ) {
                value = `calc(${(100 / num).toFixed(2)}% - ${parseInt((num - 1) * 20 / num) + 1}px)`
            }else{
                value = `calc(${(100 / (num - 1)).toFixed(2)}% - ${(parseInt(num - 2) * 20 / (num - 1)) + 1}px)`
            }
            domArr.forEach(dom => {
                dom.style.setProperty("flex-basis", value);
            })

            imgArr.forEach(imgDom => {
                const scale = imgDom.getBoundingClientRect().width / 350;
                imgDom.style.height = (scale * 200) + "px"
            })
            setIsOk(true);
        }
    }

    // 获取学习进度
    async function getProgress(params) {
        const arr = [];
        tutorials.forEach(tutorial => arr.push(tutorial.catalogueName));
        if (arr.length === 0) {
            return
        }
        await progressList({catalogueNameList: arr})
        .then(res => {
            if (res.status === 0) {
                const catalogueMap = {};
                res.data.forEach(e => {
                    catalogueMap[e.catalogueName] = {
                        readNum: e.readNum,
                        percent: e.percent
                    };
                });
                tutorials.forEach(tutorial => {
                    const catalogInfo = catalogueMap[tutorial.catalogueName];
                    if (catalogInfo) {
                        tutorial.readNum = catalogInfo.readNum;
                        tutorial.percent = catalogInfo.percent;
                    }
                })
                setTutorials([...tutorials]);
            }
        })
    }

    function changeSearch(event) {
        searchInner = event.target.value;
        setSearchInner(searchInner);
        tutorials = [];
        setTutorials([...tutorials]);
        pageConfig.page = 1;
        setPageConfig({...pageConfig});
        updateTutorials();
    }

    async function getTags(obj) {
        return await getLabelList(obj)
        .then(res => {
            if (res.status === 0) {
                const list = res.data;
                return list ? list : [];
            }
        })
    }

    async function getTutorials(obj) {
        await getTutorialList({
            ...pageConfig, status: 2, ...(obj !== undefined && obj), search_key: searchInner
        })
        .then(res => {
            if (res.status === 0) {
                const list = res.data.list;
                setTotal(res.data.total);
                setIsOver(list.length !== 20);
                tutorials = tutorials.concat(list ? list : []);
                setTutorials([...tutorials]);
            }
        })
    }

    async function init(params) {
        tags = await getTags({type: "category"});
        setTags([...tags]);
        sidebar = [{label: "type", list: tags}]; 
        setSidebar([...sidebar]);
        await getTutorials({});
        getProgress();
        run();
    }

    async function updateTutorials(params) {
        const category = selectItems[0].map(e => e.ID);
        const obj = {category};
        await getTutorials(obj);
        getProgress();
    }

    function nextPage() {
        pageConfig.page += 1;
        setPageConfig({...pageConfig});
        updateTutorials()
    }

    // 验证 URL 是否有效
    function isValidUrl(url) {
        if (!url || typeof url !== 'string' || url.trim() === '') {
            return false;
        }
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    }

    // 获取教程跳转链接
    function getTutorialLink(tutorial) {
        // 如果有 externalLink 且是有效的 URL，使用 externalLink
        if (tutorial.externalLink && isValidUrl(tutorial.externalLink)) {
            return tutorial.externalLink;
        }

        // 否则使用原来的逻辑：拼接 startPage
        const startPagePath = /^README$/i.test(tutorial?.startPage?.split("/")[1])
            ? "/"
            : "/"+(tutorial?.startPage?.split("/")[1]||"");
        return `/tutorial/${tutorial.catalogueName}${startPagePath}`;
    }

    // 初始化
    useEffect(() => {
        init();
        window.addEventListener('scroll', scrollSidebar);
        window.addEventListener('resize', run);
        return () => {
            window.removeEventListener('scroll', scrollSidebar);
            window.removeEventListener('resize', run);
        }
    },[])

    useEffect(() => {
        if (sidebarRef.current) {
            sidebarRef.current.addEventListener('scroll', runAdd);
        }
    },[sidebarRef])

    // 监听地址 ==> 获取学习进度
    useEffect(() => {
        address && getProgress()
    },[address])

    useUpdateEffect(() => {
        resizeContent();
        scrollSidebar();
    },[tutorials])

    useUpdateEffect(() => {
        pageConfig.page = 1;
        setPageConfig({...pageConfig});
        tutorials = [];
        setTutorials([...tutorials]);
        updateTutorials();
    },[selectItems])

    return (
        <div className="Lesson" ref={contentRef}>
            <div className="custom-bg-round" />
            <div className="content">
                {/* 展示列表 */}
                <div className="content-list" ref={listRef}>
                    {/* 导航栏 */}
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
                    <p className="content-subtitle">{t("header.lesson")}({total})</p>
                    <InfiniteScroll
                        className="boxs"
                        style={{opacity: isOk ? 1 : 0}}
                        dataLength={tutorials.length}
                        next={nextPage}
                        hasMore={tutorials.length !== 0 && !isOver}
                        loader={<Spin size="large" className="loading" />}
                    >
                        {
                            tutorials.map(e =>
                                <a
                                    href={getTutorialLink(e)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    key={e.catalogueName}
                                    className="box-link"
                                >
                                    <div className="box">
                                        <div className="img">
                                            <img className="img-cover" src={`https://ipfs.decert.me/${e.img}`} alt="" />
                                        </div>
                                        <div className="box-content">
                                            <p className="box-title newline-omitted">
                                                {e.label}
                                            </p>
                                            <p className="box-desc newline-omitted">
                                                {e?.desc}
                                            </p>
                                            <Divider />
                                            <ul className="data-info">
                                                <li className="font-color">
                                                    <Difficulty 
                                                        tutorial={e} 
                                                        label={t(`diff-info.${e.difficulty == 0 ? "easy" : e.difficulty == 1 ? "normal" : "diff"}`)} />
                                                </li>
                                                <li className="font-color"><div className="icon"><img src={require("@/assets/images/icon/icon-people.png")} alt="" /></div>{e?.readNum}</li>
                                                {
                                                    e?.estimateTime &&
                                                    <li className="font-color-span"><div className="icon"><img src={require("@/assets/images/icon/icon-time.png")} alt="" /></div>{totalTime(e.estimateTime)}</li>
                                                }
                                            </ul>
                                            <Divider />
                                            <ul className="tag-list">
                                                <GetTags tutorial={e} tags={tags} />
                                            </ul>
                                        </div>
                                        
                                            
                                            <div className="position">
                                                <div className="type">
                                                    <img src={require(`@/assets/images/icon/${e.docType === "video" ? "icon-video" : "icon-article"}.png`)} alt="" />
                                                </div>
                                                {
                                                    typeof e.percent === "number" && e?.percent != 0 &&
                                                    <div className="progress">
                                                        {t("progress")} {parseInt(e.percent * 100)}%
                                                    </div>
                                                }
                                            </div>
                                    </div>
                                </a>
                            )
                        }
                    </InfiniteScroll>
                </div>
            </div>
        </div>
    )
}