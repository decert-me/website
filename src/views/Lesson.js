import "@/assets/styles/view-style/lesson.scss"
import "@/assets/styles/mobile/view-style/lesson.scss"
import { useTranslation } from "react-i18next";
import { useContext, useEffect, useRef, useState } from "react";
import { progressList } from "@/request/api/public";
import { Button, Divider, Drawer, Spin } from "antd";
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

function SelectItems({selectItems: items, removeItem, removeAllItems, sidebarIsOpen, changeSidebar, t}) {
    const result = [];
    for (let i = 0; i < items.length; i++) {
        const element = items[i];
        element.forEach(item => {
            result.push({
                ...item, 
                index: i
            })
        })
    }
    return (
        (result.length !== 0 || !sidebarIsOpen) &&
        <div className="selectItems">
            {
                !sidebarIsOpen &&
                <div className="icon" onClick={() => changeSidebar()}>
                    <img src={require("@/assets/images/icon/icon-filter.png")} alt="" />
                </div>
            }
            {
                result.map((item) => 
                    <div 
                        className="selectItem" 
                        key={item.ID}
                        onClick={() => removeItem(item.key, item.index)}
                    >
                        {i18n.language === "zh-CN" ? item.Chinese : item.English} <img src={require("@/assets/images/icon/icon-close.png")} alt="" />
                    </div>
                )
            }
            {
                result.length !== 0 &&
                    <div className="selectItem" onClick={() => removeAllItems()}>
                        {t("tutorial.clear")}
                    </div>
            }
        </div>
    )
}

export default function Lesson(params) {
    
    const contentRef = useRef(null);
    const sidebarRef = useRef(null);
    const listRef = useRef(null);
    const buttonRef = useRef(null);
    const childRef = useRef(null);
    
    const { isMobile } = useContext(MyContext);
    const { t } = useTranslation();
    const { address } = useAddress();
    const [openM, setOpenM] = useState(false);    //  移动端抽屉
    let [tutorials, setTutorials] = useState([]);   //  教程列表
    
    let [sidebarIsOpen, setSidebarIsOpen] = useState(true);   //  侧边栏展开
    let [isOk, setIsOk] = useState(false);   //  dom操作是否完成
    let [selectItems, setSelectItems] = useState([[],[],[]]);   //  当前选中的类别
    let [tags, setTags] = useState([]);     //  所选标签
    let [sidebar, setSidebar] = useState([]);     //  所选语种标签

    let [isOver, setIsOver] = useState();   //  无限滚动
    let [pageConfig, setPageConfig] = useState({
        page: 1, pageSize: 20
    });   //  分页配置
    const loader = useRef(null);


    
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

    // 移除选中的单个 *类别*
    function removeItem(key, index) {
        let singleSelectItems = selectItems[index];
        const i = singleSelectItems.findIndex(e => e.key === key);
        singleSelectItems.splice(i, 1);
        selectItems[index] = singleSelectItems;
        setSelectItems([...selectItems]);
    }

    // 移除所有 *类别*
    function removeAllItems() {
        selectItems=[[],[],[],[]];
        setSelectItems([...selectItems]);
    }

    // 获取当前选中的 *类别* 列表
    function changeSelectItems(items, index) {
        selectItems[index] = items;
        setSelectItems([...selectItems]);
    }

    // 展开 || 关闭侧边栏
    function changeSidebar() {
        sidebarIsOpen = !sidebarIsOpen;
        setSidebarIsOpen(sidebarIsOpen);

        if (sidebarIsOpen) {
            sidebarRef.current.style.left = "0";
            listRef.current.style.width = "calc(100% - 380px - 10px)";
            listRef.current.style.paddingLeft = "30px"
        }else{
            sidebarRef.current.style.left = "-380px";
            listRef.current.style.width = "100%"
            listRef.current.style.paddingLeft = "37px"
        }
        run()
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
            ...pageConfig, status: 2, ...(obj !== undefined && obj)
        })
        .then(res => {
            if (res.status === 0) {
                const list = res.data.list;
                if (list.length !== 20) {
                    setIsOver(true);
                }
                tutorials = tutorials.concat(list ? list : []);
                setTutorials([...tutorials]);
            }
        })
    }

    async function init(params) {
        tags = await getTags({type: "category"});
        setTags([...tags]);

        const lang = await getTags({type: "language"});
        sidebar = [
            { label: "type", list: tags },
            { label: "media", list: [{ID: "article", Chinese: "文章", English: "Article"}, {ID: "video", Chinese: "视频", English: "Video"}] },
            { label: "lang", list: lang }
        ]
        setSidebar([...sidebar]);
        await getTutorials({});
        getProgress();
        run();
    }

    function updateTutorials(params) {
        const docType = selectItems[1].map(e => e.ID);
        const language = selectItems[2].map(e => e.ID);
        const category = selectItems[0].map(e => e.ID);
        const obj = {
            ...(language.length === 1 && { language: language[0] }),
            ...(docType.length === 1 && { docType: docType[0] }),
            category
          };
        getTutorials(obj);
    }

    function nextPage() {
        pageConfig.page += 1;
        setPageConfig({...pageConfig});
        updateTutorials()
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
        if (openM) {
            document.body.style.overflow = "hidden";
        }else{
            document.body.style.overflow = "auto";
        }
    },[openM])

    useUpdateEffect(() => {
        resizeContent();
        scrollSidebar();
    },[tutorials])

    useUpdateEffect(() => {
        tutorials = [];
        setTutorials([...tutorials]);
        updateTutorials();
    },[selectItems])

    return (
        <div className="Lesson" ref={contentRef}>
            <div className="custom-bg-round" />
            <div className="content">
                {/* 侧边栏 */}
                {
                    isMobile ? 
                    <Drawer
                        placement="bottom"
                        closable={false}
                        onClose={() => setOpenM(false)}
                        open={openM}
                        mask={false}
                        rootClassName="drawer-sidebar"
                        getContainer={() => document.querySelector(".Lesson .content")}
                    >
                        <div className="content-sidebar">
                            <div className="sidebar-list">
                                <div className="close tutorial-icon-full icon" onClick={() => setOpenM(false)}>
                                    <img src={require("@/assets/images/icon/icon-close.png")} alt="" />
                                </div>
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
                        </div>
                    </Drawer>
                    :
                    <div className="content-sidebar" ref={sidebarRef}>
                        <Button 
                            type="default" 
                            className="sidebar-title"
                            onClick={() => changeSidebar()}
                            ref={buttonRef}
                        >
                            <div className="icon">
                                <img src={require("@/assets/images/icon/icon-filter.png")} alt="" />
                            </div>
                            {t("tutorial.filter")}
                        </Button>
                        <div className="sidebar-list">
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
                    </div>
                }
                {/* 展示列表 */}
                <div className="content-list" ref={listRef}>
                    {/* 导航栏 */}
                    <SelectItems selectItems={selectItems} removeItem={removeItem} removeAllItems={removeAllItems} sidebarIsOpen={sidebarIsOpen} changeSidebar={changeSidebar} t={t} />
                    <p className="content-title">{t("header.lesson")}</p>
                    {
                        isMobile && 
                        <div className="tutorials-operate">
                            <div className="tutorial-icon-full filter-icon icon" onClick={() => setOpenM(true)}>
                                <img src={require("@/assets/images/icon/icon-filter.png")} alt="" />
                            </div>
                        </div>
                    }

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
                                    href={`/tutorial/${e.catalogueName}${/^README$/i.test(e.startPage.split("/")[1]) ? "/" : "/"+(e.startPage.split("/")[1]||"")}`} 
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