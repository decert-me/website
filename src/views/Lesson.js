import "@/assets/styles/view-style/lesson.scss"
import "@/assets/styles/mobile/view-style/lesson.scss"
import { useTranslation } from "react-i18next";
import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAccount } from "wagmi";
import { tutorialProgress } from "@/request/api/public";
import { Button, Divider, Drawer } from "antd";
import CustomCategory from "@/components/CustomCategory";
import MyContext from "@/provider/context";

function SelectItems({selectItems: items, removeItem, removeAllItems}) {
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
        result.length !== 0 &&
        <div className="selectItems">
            {
                result.map((item) => 
                    <div 
                        className="selectItem" 
                        key={item.key}
                        onClick={() => removeItem(item.key, item.index)}
                    >
                        {item.label}
                    </div>
                )
            }
            {
                result.length !== 0 &&
                    <div className="selectItem" onClick={() => removeAllItems()}>
                        Clear All
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
    const { address } = useAccount();
    const { tutorialsSidebar } = require("../mock/index");
    const [openM, setOpenM] = useState(false);    //  移动端抽屉
    let [tutorials, setTutorials] = useState([]);   //  教程列表
    let [sidebarIsOpen, setSidebarIsOpen] = useState(true);   //  侧边栏展开
    let [selectItems, setSelectItems] = useState([[],[],[],[]]);   //  当前选中的类别

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
            listRef.current.style.width = "80.21%";
            listRef.current.style.paddingLeft = "30px"
            buttonRef.current.style.position = "absolute";
            buttonRef.current.style.left = "40px";
        }else{
            sidebarRef.current.style.left = "calc(-19.79% - 10px)";
            listRef.current.style.width = "100%"
            listRef.current.style.paddingLeft = "37px"
            buttonRef.current.style.position = "fixed";
            buttonRef.current.style.left = "0px";
        }
    }

    // 页面滑动出content区域侧边栏高度改变
    function scrollSidebar() {
        if (contentRef.current) {
            const elementRect = contentRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
            if (elementRect.bottom <= viewportHeight) {
                const bottom = viewportHeight - elementRect.bottom
                sidebarRef.current.style.height = `calc(100vh - ${bottom}px - 82px)`
            }
            
        }
    }

    // 获取学习进度
    async function getProgress(params) {
        for (let i = 0; i < tutorials.length; i++) {
            await tutorialProgress({catalogueName: tutorials[i].catalogueName})
            .then(res => {
                if (res?.status === 0 && res.data.data) {
                    const data = res.data.data;
                    let sum = 0;
                    data.forEach(element => {
                        element.is_finish && sum++
                    });
                    tutorials[i].progress = (sum / data.length * 100).toFixed(0)
                }
            })
        }
        setTutorials([...tutorials]);
    }

    function init(params) {
        const host = window.location.origin;
        axios.get(`${host.indexOf("localhost") === -1 ? host : "https://decert.me"}/tutorial/tutorials.json`)
        .then(res => {
            tutorials = res.data;
            setTutorials([...tutorials]);
        })
        .catch(err => {
            console.log(err);
        })
    }

    // 初始化
    useEffect(() => {
        init();
        window.addEventListener('scroll', scrollSidebar)
        return () => {
            window.removeEventListener('scroll', scrollSidebar)
        }
    },[])

    // 监听地址 ==> 获取学习进度
    useEffect(() => {
        address && getProgress()
    },[address])

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
                            <div className="close tutorial-icon-full" onClick={() => setOpenM(false)}></div>
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
                    </Drawer>
                    :
                    <div className="content-sidebar" ref={sidebarRef}>
                        <Button 
                            type="default" 
                            className="sidebar-title"
                            onClick={() => changeSidebar()}
                            ref={buttonRef}
                        >
                            <div className="icon"></div>
                            Filters
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
                    <SelectItems selectItems={selectItems} removeItem={removeItem} removeAllItems={removeAllItems} />
                    <p className="content-title">{t("header.lesson")}</p>
                    {
                        isMobile && 
                        <div className="tutorials-operate">
                            <div className="tutorial-icon-full filter-icon" onClick={() => setOpenM(true)}></div>
                        </div>
                    }
                    <div className="boxs">
                        {
                            tutorials.map(e => 
                                <a 
                                    href={`https://decert.me/tutorial/${e.catalogueName}${/^README$/i.test(e.startPage.split("/")[1]) ? "/" : "/"+e.startPage.split("/")[1]}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    key={e.catalogueName}
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
                                                <li className="font-color"><div className="point"></div>简单</li>
                                                <li className="font-color"><div className="icon"></div>6</li>
                                                <li className="font-color-span"><div className="icon"></div>8 m</li>
                                            </ul>
                                            <Divider />
                                            <ul className="tag-list">
                                                <li className="tag">公链</li>
                                                <li className="tag">公链</li>
                                                <li className="tag">公链</li>
                                                <li className="tag">公链</li>
                                                <li className="tag">公链</li>
                                                <li className="tag">公链</li>
                                                <li className="tag">公链</li>
                                            </ul>
                                        </div>
                                        {
                                            e?.progress &&
                                            <div className="progress">
                                                {t("progress")} {e.progress}%
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