import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
import { useTranslation } from "react-i18next";
import { Button, Rate, Tour } from "antd";
import { Viewer } from "@bytemd/react";
import { download } from "@/utils/file/download";
import { GetPercentScore } from "@/utils/GetPercent";
import { reviewOpenQuest } from "@/request/api/judg";
import CustomIcon from "@/components/CustomIcon";


function RatingModal({data, isMobile, onFinish}, ref) {

    const star = useRef(null);
    const { t } = useTranslation(["rate", "translation"]);
    const [open, setOpen] = useState(false);    //  漫游引导展示
    let [detail, setDetail] = useState();
    let [openQuest, setOpenQuest] = useState([]);
    let [reviewQuests, setReviewQuests] = useState([]);
    let [selectOpenQs, setSelectOpenQs] = useState({});
    let [page, setPage] = useState(0);

    const steps = [
        {
          cover: (
            <div>
                <img
                    alt="tour.png"
                    src={require("@/assets/images/img/touch.gif")}
                    id="tourImg"
                    style={{
                    width: "100px",
                    marginTop: "-40px"
                    }}
                />
                <Button className="custom-ikonw" ghost onClick={() => setOpen(false)} >{t("translation:btn-ok")}</Button>
            </div>
          ),
          target: () => star.current,
        }
    ]

    // 比对当前已打分length 
    function isOver() {
        const flag = reviewQuests.length === detail.length;
        const remain = detail.length - reviewQuests.length;
        return  {flag, remain}
    }

    async function confirm(params) {
        // 没有改分直接退出
        if (reviewQuests.length === 0) {
            return
        }
        await reviewOpenQuest(reviewQuests)
        reviewQuests = [];
        setReviewQuests([...reviewQuests]);
        onFinish();
    }

    async function init() {
        page = 0;
        setPage(page);
        detail = data?.filter(e => e.open_quest_review_status === 1);
        setDetail([...detail]);
        // 获取开放题列表
        const arr = [];
        detail.forEach((quest, i) => {
            arr.push({
                index: i,
                isPass: null,
                rate: 0,
                title: quest.title,
                value: quest.answer.value,
                annex: quest.answer.annex,
                challenge_title: quest.challenge_title
            })
        })

        openQuest = arr;
        setOpenQuest([...openQuest]);
        selectOpenQs = openQuest[page];
        setSelectOpenQs({...selectOpenQs});

        // 判断是否是第一次进入该页面
        const isFrist = localStorage.getItem("decert.rate");
        if (!isFrist) {
            setOpen(true);
            localStorage.setItem("decert.rate", true);
            setTimeout(() => {
                if (star?.current) {
                    const tourImg = document.getElementById("tourImg");
                    tourImg.style.marginLeft = `${star.current?.offsetWidth}px`;
                }
            }, 50);
        }
    }

    // 切换上下题
    function changePage(newPage) {
        page = newPage;
        setPage(page);
        selectOpenQs = openQuest[page];
        setSelectOpenQs({...selectOpenQs});
    }

    function getScore(percent) {
        // 记录rate
        openQuest[page].rate = percent;
        setOpenQuest([...openQuest]);
        selectOpenQs.rate = percent;
        setSelectOpenQs({...selectOpenQs});

        // 已打分列表
        const p = percent * 20 / 100;
        const info = detail[page];
        const score = GetPercentScore(info.score, p)
        const obj = {
            "id": info.ID,
            "answer": {
                "type": "open_quest",
                "annex": selectOpenQs.annex,
                "value": selectOpenQs.value,
                "score": score,
                "open_quest_review_time": new Date().toLocaleString().replace(/\//g, "-")
            },
            "index": info.index,
            "updated_at": info.updated_at
        };
        // 判断是否是新的
        const index = reviewQuests.findIndex(function(item) {
            return item.id === info.ID && item.index === info.index;
        });

        if (index === -1) {
            reviewQuests.push(obj)
        }else{
            reviewQuests[index] = obj;
        }
        setReviewQuests([...reviewQuests]);
    }

    useEffect(() => {
        data && init();
    },[data])

    useImperativeHandle(ref, () => ({
        confirm,
        isOver
    }))

    return (
        detail &&
        <div className="judg-content">
            <h1>{selectOpenQs?.challenge_title}</h1>
                <div className="judg-info">
                    <div className="item">
                        <p className="item-title">{t("quest")}:</p>
                        <div className="item-content">
                            <Viewer value={selectOpenQs?.title} />
                        </div>
                    </div>

                    <div className="item">
                        <p className="item-title">{t("ans")}:</p>
                        <p className="item-content box">{selectOpenQs?.value}</p>
                    </div>

                    <div className="item">
                        <p className="item-title">{t("annex")}:</p>
                        <div className="item-content">
                            {
                                selectOpenQs?.annex && selectOpenQs?.annex.map(e => (
                                    <Button type="link" key={e.name} onClick={() => download(e.hash, e.name)}>{e.name}</Button>
                                ))
                            }
                        </div>
                    </div>

                    <div className="item mb40">
                        <div className="item-title flex">
                            {t("score")}: 
                            <div 
                                ref={star}
                            >
                                <Rate 
                                    allowHalf 
                                    value={selectOpenQs?.rate}
                                    style={{color: "#DD8C53"}} 
                                    character={<CustomIcon type="icon-star" className="icon" />} 
                                    onChange={(percent) => getScore(percent)}
                                />
                            </div>
                        </div>
                    </div>
                    
                </div>
            <div className="pagination">
                <Button disabled={page === 0} onClick={() => changePage(page - 1)}>{t("prev")}</Button>
                <p>{page + 1}/<span style={{color: "#8B8D97"}}>{openQuest.length}</span></p>
                <Button disabled={page+1 === openQuest.length} onClick={() => changePage(page + 1)}>{t("next")}</Button>
            </div>
            <Tour rootClassName={`custom-tour ${isMobile ? "mobile-custom-tour" : ""}`} open={open} steps={steps} closeIcon={<></>} placement="bottomLeft" />
        </div>
    )
}

export default forwardRef(RatingModal)