import "@/assets/styles/view-style/lesson.scss"
import "@/assets/styles/mobile/view-style/lesson.scss"
import { useTranslation } from "react-i18next";
import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAccount } from "wagmi";
import { progressList } from "@/request/api/public";
import { Button, Divider, Drawer } from "antd";
import CustomCategory from "@/components/CustomCategory";
import MyContext from "@/provider/context";
import { useRequest, useUpdateEffect } from "ahooks";
import { totalTime } from "@/utils/date";

function Difficulty({tutorial, label}) {
    let color = "";

    switch (tutorial.difficulty) {
        case 0:
            color = "#FFB21E";
            break;
        case 1:
            color = "#5887E1";
            label = "中等";
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

function GetTags({ tutorial, t }) {
    const arr = [];
    tutorial.category.forEach(ele => {
        arr.push(ele)
    })
    tutorial.theme.forEach(ele => {
        arr.push(ele)
    })
    return (
        arr.map((item,index) => 
            <li className="tag" key={index}>{t(`tutorial.${item}`)}</li>
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
                        key={item.key}
                        onClick={() => removeItem(item.key, item.index)}
                    >
                        {t(`tutorial.${item.label}`)} <img src={require("@/assets/images/icon/icon-close.png")} alt="" />
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
    const boxsRef = useRef(null);
    
    const { isMobile } = useContext(MyContext);
    const { t } = useTranslation();
    const { address } = useAccount();
    const { tutorialsSidebar } = require("../mock/index");
    const [openM, setOpenM] = useState(false);    //  移动端抽屉
    let [tutorials, setTutorials] = useState([]);   //  教程列表
    let [newTutorials, setNewTutorials] = useState([]);   //  选中的教程列表
    
    let [sidebarIsOpen, setSidebarIsOpen] = useState(true);   //  侧边栏展开
    let [isOk, setIsOk] = useState(false);   //  dom操作是否完成
    let [selectItems, setSelectItems] = useState([[],[],[],[]]);   //  当前选中的类别
    
    const { data, loading, run } = useRequest(resizeContent, {
        debounceWait: 300,
        manual: true,
    });

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

    function filterTutorials(params) {
        const arr = [];
        
        if (selectItems.every(item => item.length === 0)) {
            newTutorials = tutorials;
            setNewTutorials([...newTutorials]);
            return
        }

        tutorials.forEach(tutorial => {
            if (
                (
                    selectItems[0].some(item => tutorial.category.includes(item.label)) || 
                    selectItems[1].some(item => tutorial.theme.includes(item.label)) || 
                    selectItems[3].some(item => tutorial.language.includes(item.value))
                ) &&
                (
                    selectItems[2].length === 0 || 
                    selectItems[2].some(item => tutorial.docType.includes(item.value))
                )
            ) {
                arr.push(tutorial)
            }
        })
        newTutorials = arr;
        setNewTutorials([...newTutorials]);
    }

    // 页面滑动出content区域侧边栏高度改变
    function scrollSidebar() {
        if (listRef.current) {
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

    function resizeContent() {
        if (boxsRef.current) {
            const domArr = document.querySelectorAll(".boxs .box-link");
            const contentWidth = boxsRef.current.getBoundingClientRect().width;
            const num = parseInt(contentWidth / 350);
            let value;
            // 如果够展开
            if ((((num - 1) * 20) + (350 * num)) <= contentWidth ) {
                value = `calc(${(100 / num).toFixed(2)}% - ${parseInt((num - 1) * 20 / num)}px)`
            }else{
                value = `calc(${(100 / (num - 1)).toFixed(2)}% - ${(parseInt(num - 2) * 20 / (num - 1))}px)`
            }
            domArr.forEach(dom => {
                dom.style.setProperty("flex-basis", value);
            })
            setIsOk(true);
        }
    }

    // 获取学习进度
    async function getProgress(params) {
        const arr = [];
        tutorials.forEach(tutorial => arr.push(tutorial.catalogueName));
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

    function init(params) {
        const host = window.location.origin;
        axios.get(`${host.indexOf("localhost") === -1 ? host : "https://decert.me"}/tutorial/tutorials.json`)
        .then(res => {
            // tutorials = res.data;
            tutorials = [
                {
                "repoUrl": "https://github.com/decert-me/blockchain-basic",
                "label": "区块链基础",
                "catalogueName": "blockchain-basic",
                "docType": "docusaurus",
                "img": "https://ipfs.decert.me/images/blockchain-basic.png",
                "desc": "区块链是一项令人兴奋且在快速发展的技术，你也许看到过这些频繁在社交媒体、新闻频道上冒出的新名词：智能合约、代币（通证）、Web3、DeFi、DAO 组织。 如果你还不是很明白他们的意思，这份免费区块链基础教程就是为你（小白们）准备的。",
                "challenge": 10000,
                "startPage": "blockchain-basic/start",
                "category": ["dapps"],
                "theme": ["defi"],
                "language": "zh",
                "time": 9000000,  //  预估时间
                "difficulty": 2     //  难度
                },
                {
                "repoUrl": "https://github.com/decert-me/learnsolidity",
                "label": "学习 Solidity",
                "catalogueName": "solidity",
                "img": "https://ipfs.decert.me/images/learn-solidity.png",
                "desc": "Solidity是一种专门为以太坊平台设计的编程语言，它是EVM智能合约的核心，是区块链开发人员必须掌握的一项技能。",
                "docType": "docusaurus",
                "challenge": 10002,
                "startPage": "solidity/intro",
                "category": ["chain-public"],
                "theme": ["btc"],
                "language": "zh",
                "time": 9000000,  //  预估时间
                "difficulty": 2     //  难度
                },
                {
                "repoUrl": "https://github.com/SixdegreeLab/MasteringChainAnalytics",
                "label": "成为链上数据分析师",
                "catalogueName": "MasteringChainAnalytics",
                "img": "https://ipfs.learnblockchain.cn/images/sixdegree.png",
                "desc": "本教程是一个面向区块链爱好者的系列教程，帮助新手用户从零开始学习区块链数据分析，成为一名链上数据分析师。",
                "docType": "gitbook",
                "challenge": 10004,
                "commitHash": "cfb5403f14932b520adc9084673bd1c011f1aa2b",
                "startPage": "MasteringChainAnalytics/README",
                "category": ["layer2"],
                "theme": ["web3"],
                "language": "zh",
                "time": 9000000,  //  预估时间
                "difficulty": 2     //  难度
                },
                {
                "repoUrl": "https://github.com/miguelmota/ethereum-development-with-go-book",
                "label": "用Go来做以太坊开发",
                "catalogueName": "ethereum-development-with-go-book",
                "img": "https://ipfs.learnblockchain.cn/images/ethereum-development-with-go.jpg",
                "desc": "这本迷你书的本意是给任何想用Go进行以太坊开发的同学一个概括的介绍。本意是如果你已经对以太坊和Go有一些熟悉，但是对于怎么把两者结合起来还有些无从下手，那这本书就是一个好的起点。",
                "docType": "gitbook",
                "branch": "master",
                "docPath": "/zh",
                "startPage": "ethereum-development-with-go-book/README",
                "category": ["safe"],
                "theme": ["blockchain"],
                "language": "zh",
                "time": 9000000,  //  预估时间
                "difficulty": 2     //  难度
                },
                {
                "repoUrl": "https://github.com/RandyPen/sui-move-intro-course-zh",
                "label": "Sui Move 导论",
                "startPage": "sui-move-intro-course-zh/README",
                "catalogueName": "sui-move-intro-course-zh",
                "img": "https://ipfs.learnblockchain.cn/images/sui.png",
                "docType": "mdBook",
                "category": ["storage"],
                "theme": ["metaverse"],
                "language": "zh",
                "time": 9000000,  //  预估时间
                "difficulty": 2     //  难度
                },
                {
                "repoUrl": "https://github.com/ingonyama-zk/ingopedia",
                "label": "ZKP Encyclopedia",
                "startPage": "ingopedia/communityguide",
                "catalogueName": "ingopedia",
                "img": "https://ipfs.learnblockchain.cn/images/helmet4a.png",
                "desc": "A curated list of ZK/FHE resources and links. ",
                "docType": "mdBook",
                "branch": "master",
                "docPath": "/src",
                "commitHash": "9f27ed7ab0fdd92c446a14e1df59891c17f6e8ed",
                "category": ["others"],
                "theme": ["cryptography", "eth", "dao"],
                "language": "en",
                "time": 9000000,  //  预估时间
                "difficulty": 2     //  难度
                }
                ]
            tutorials.forEach(tutorial => {
                tutorial.docType = tutorial.docType === "video" ? "video" : "article";
            })
            setTutorials([...tutorials]);
            getProgress();
            filterTutorials();
            run();
        })
        .catch(err => {
            console.log(err);
        })
    }

    useUpdateEffect(() => {
        // 比较筛选 ===> 
        filterTutorials();
    },[selectItems])

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
                                    tutorialsSidebar.map((item, i) => 
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
                                tutorialsSidebar.map((item, i) => 
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
                    <div className="boxs" ref={boxsRef} style={{opacity: isOk ? 1 : 0}}>
                        {
                            newTutorials.map(e => 
                                <a 
                                    href={`https://decert.me/tutorial/${e.catalogueName}${/^README$/i.test(e.startPage.split("/")[1]) ? "/" : "/"+e.startPage.split("/")[1]}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    key={e.catalogueName}
                                    className="box-link"
                                >
                                    <div className="box">
                                        <div className="img">
                                            <img src={e?.img?.indexOf("http") === -1 ? require(`@/${e.img}`) : e.img} alt="" />
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
                                                <li className="font-color"><Difficulty tutorial={e} label={t(`diff-info.${e.difficulty === 0 ? "easy" : e.difficulty === 1 ? "normal" : "diff"}`)} /></li>
                                                <li className="font-color"><div className="icon"><img src={require("@/assets/images/icon/icon-people.png")} alt="" /></div>{e?.readNum}</li>
                                                <li className="font-color-span"><div className="icon"><img src={require("@/assets/images/icon/icon-time.png")} alt="" /></div>{totalTime(e.time)}</li>
                                            </ul>
                                            <Divider />
                                            <ul className="tag-list">
                                                <GetTags tutorial={e} t={t} />
                                            </ul>
                                        </div>
                                        {
                                            e.percent !== 0 &&
                                            <div className="progress">
                                                {t("progress")} {parseInt(e.percent * 100)}%
                                            </div>
                                        }
                                    </div>
                                </a>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}