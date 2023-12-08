import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import { Button, Radio, Rate, message } from "antd";
import { download } from "../../utils/file/download";
// import { reviewOpenQuest } from "../../request/api/judgment";
// import { getUserOpenQuestList } from "@/request/api/public";
import { Viewer } from "@bytemd/react";
import CustomIcon from "@/components/CustomIcon";
import { GetPercentScore } from "@/utils/GetPercent";
import { reviewOpenQuest } from "@/request/api/judg";


function RatingModal({data, onFinish}, ref) {

    let [detail, setDetail] = useState();
    let [openQuest, setOpenQuest] = useState([]);
    let [reviewQuests, setReviewQuests] = useState([]);
    let [selectOpenQs, setSelectOpenQs] = useState({});
    let [page, setPage] = useState(0);

    async function confirm(params) {
        await reviewOpenQuest(reviewQuests)
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
        confirm
    }))

    return (
        detail &&
        <div className="judg-content">
            <h1>{selectOpenQs?.challenge_title}</h1>
                <div className="judg-info">
                    <div className="item">
                        <p className="item-title">题目:</p>
                        <div className="item-content">
                            <Viewer value={selectOpenQs?.title} />
                        </div>
                    </div>

                    <div className="item">
                        <p className="item-title">答案:</p>
                        <p className="item-content box">{selectOpenQs?.value}</p>
                    </div>

                    <div className="item">
                        <p className="item-title">附件:</p>
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
                            评分: 
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
            <div className="pagination">
                <Button disabled={page === 0} onClick={() => changePage(page - 1)}>上一题</Button>
                <p>{page + 1}/<span style={{color: "#8B8D97"}}>{openQuest.length}</span></p>
                <Button disabled={page+1 === openQuest.length} onClick={() => changePage(page + 1)}>下一题</Button>
            </div>
        </div>
    )
}

export default forwardRef(RatingModal)