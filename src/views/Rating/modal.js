import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
import { useTranslation } from "react-i18next";
import { Button, Rate, Tour } from "antd";
import { Viewer } from "@bytemd/react";
import { download } from "@/utils/file/download";
import { GetPercentScore } from "@/utils/GetPercent";
import { getUserOpenQuestList, reviewOpenQuest } from "@/request/api/judg";
import CustomIcon from "@/components/CustomIcon";


function RatingModal({data, rateNum, pageNum, isMobile, onFinish}, ref) {

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
        if (onFinish) {
            detail = data?.filter(e => e.open_quest_review_status === 1);
        }else{
            detail = data;
        }

        // 创建指定长度的数组
        const length = rateNum;
        const allArr = Array.from({ length });
        // 对数组的指定范围（索引10-20）写入数据
        const start = (pageNum - 1) * 10;
        const end = start + 10 > rateNum ? rateNum : start + 10;
        const allData = Array.from({ length: end - start }, (_, index) => index + start);
        allData.forEach((value, index) => {
            allArr[start + index] = detail[index];
        });
        detail = allArr;
        setDetail([...detail]);
        // 获取开放题列表
        const arr = [];
        detail.forEach((quest, i) => {
            let rate = 0;
            // 展示模式获取当前得分
            if (!onFinish) {
                rate = quest.answer?.correct ? quest.score : (quest.answer.score / quest.score * 5);
            }
            arr.push(quest ? {
                index: i,
                isPass: null,
                rate: rate,
                title: quest.title,
                value: quest.answer.value,
                annex: quest.answer.annex,
                challenge_title: quest.challenge_title
            } : null)
        })



        openQuest = arr;
        setOpenQuest([...openQuest]);
        page = start;
        setPage(page);
        selectOpenQs = openQuest[page];
        setSelectOpenQs({...selectOpenQs});

        // 判断是否是第一次进入该页面 => 提示如何评分动画
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
    async function changePage(newPage) {
        // 当指定索引内容为null时 加载新内容
        if (!openQuest[newPage]) {
            const page = Math.trunc(newPage/10) + 1;
            await getUserOpenQuestList({
                open_quest_review_status: 1,
                pageSize: 10,
                page
            })
            .then(res => {
                const list = res.data.list;
                const data = list ? list : [];
                // 添加key
                data.forEach((ele, index) => {
                    ele.key = ele.updated_at + ele.index + index
                })
                const start = (page - 1) * 10;
                const end = start + 10 > rateNum ? rateNum : start + 10;
                const allData = Array.from({ length: end - start }, (_, index) => index + start);
                allData.forEach((value, index) => {
                    detail[start + index] = data[index];
                    openQuest[start + index] = {
                        index: start + index,
                        isPass: null,
                        rate: 0,
                        title: data[index].title,
                        value: data[index].answer.value,
                        annex: data[index].answer.annex,
                        challenge_title: data[index].challenge_title
                    }
                });
                setDetail([...detail])
                setOpenQuest([...openQuest])
            })
        }
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
                                    disabled={!onFinish}     //  预览模式不可选
                                    value={selectOpenQs?.rate}
                                    style={{color: "#DD8C53"}} 
                                    character={<CustomIcon type="icon-star" className="icon" />} 
                                    onChange={(percent) => getScore(percent)}
                                />
                            </div>
                        </div>
                    </div>
                    
                </div>
            {
                onFinish &&
                <>
                    <div className="pagination">
                        <Button disabled={page === 0} onClick={() => changePage(page - 1)}>{t("prev")}</Button>
                        <p>{page + 1}/<span style={{color: "#8B8D97"}}>{rateNum}</span></p>
                        <Button disabled={page+1 === rateNum} onClick={() => changePage(page + 1)}>{t("next")}</Button>
                    </div>
                    <Tour rootClassName={`custom-tour ${isMobile ? "mobile-custom-tour" : ""}`} open={open} steps={steps} closeIcon={<></>} placement="bottomLeft" />
                </>
            }
        </div>
    )
}

export default forwardRef(RatingModal)