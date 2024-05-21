import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Button, Spin, Input, Slider, InputNumber } from "antd";
import { Viewer } from "@bytemd/react";
import { download } from "@/utils/file/download";
import { GetPercentScore } from "@/utils/GetPercent";
import {
    getUserOpenQuestDetailList,
    reviewOpenQuest,
} from "@/request/api/judg";
import { NickName } from "@/utils/NickName";

const { TextArea } = Input;

function RatingModal({ data, isMobile, onFinish }, ref) {
    const star = useRef(null);
    const { t } = useTranslation(["rate", "translation"]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState();
    let [list, setList] = useState([]);

    let [reviewQuests, setReviewQuests] = useState([]);
    let [selectOpenQs, setSelectOpenQs] = useState({});
    let [page, setPage] = useState(0);
    let [pageNum, setPageNum] = useState(1);
    let [rateCache, setRateCache] = useState({
        rate: 0,
        annotation: ""
    });

    const timestamp = (time) => {
        return time?.replace("T"," ").split("+")[0].split(".")[0] || "";
    }

    // 比对当前已打分length
    function isOver() {
        const flag = reviewQuests.length === total;
        const remain = total - reviewQuests.length;
        return { flag, remain };
    }

    async function confirm(params) {
        // 没有改分直接退出
        if (reviewQuests.length === 0) {
            return;
        }
        await reviewOpenQuest(reviewQuests);
        clearList();
        onFinish();
    }

    async function getList(page) {
        try {
            const { data: res } = await getUserOpenQuestDetailList({
                page,
                pageSize: 10,
                ...data,
            });
            list = list.concat(res.list || []);
            setList([...list]);
            setTotal(res.total);
        } catch (error) {
            console.log(error);
        }
    }

    async function init() {
        page = 0;
        setPage(page);
        try {
            await getList(pageNum);
            selectOpenQs = list[page];
            setSelectOpenQs({ ...selectOpenQs });
        } catch (error) {
            console.log("===>", error);
        }
    }

    // 切换上下题
    async function changePage(newPage) {
        if (newPage === list.length) {
            pageNum += 1;
            setPageNum(pageNum);
            await getList(pageNum);
        }
        // 当指定索引内容为null时 加载新内容
        page = newPage;
        setPage(page);
        selectOpenQs = list[newPage];
        setSelectOpenQs({ ...selectOpenQs });
        const obj = {
            score: selectOpenQs?.rate ? Number((selectOpenQs?.rate * 0.2 * selectOpenQs.score).toFixed(1)) : null,
            annotation: selectOpenQs?.annotation || ""
        }
        rateCache = obj;
        setRateCache({...rateCache});
    }

    function setAnnotation(text) {
        // 批注
        list[page].annotation = text;
        setList([...list]);
        selectOpenQs.annotation = text;
        setSelectOpenQs({ ...selectOpenQs });

        rateCache.annotation = text;
        setRateCache({...rateCache});
        setCache()
    }

    function setPercent(percent) {
        // 记录rate
        list[page].rate = percent;
        setList([...list]);
        selectOpenQs.rate = percent;
        setSelectOpenQs({ ...selectOpenQs });

        // 已打分列表
        const p = (percent * 20) / 100;
        const info = list[page];
        const score = GetPercentScore(info.score, p);
        rateCache.score = score;
        setRateCache({...rateCache});
        setCache()
    }

    function setCache() {
        const info = list[page];
        const obj = {
            id: info.ID,
            answer: {
                type: "open_quest",
                annex: selectOpenQs.answer.annex,
                value: selectOpenQs.answer.value,
                score: rateCache.score,
                annotation: rateCache.annotation,
                open_quest_review_time: new Date()
                    .toLocaleString()
                    .replace(/\//g, "-"),
            },
            index: info.index,
            updated_at: info.updated_at,
        };
        // 判断是否是新的
        const index = reviewQuests.findIndex(function (item) {
            return item.id === info.ID && item.index === info.index;
        });

        if (index === -1) {
            reviewQuests.push(obj);
        } else {
            reviewQuests[index] = obj;
        }
        setReviewQuests([...reviewQuests]);
    }

    function clearList() {
        pageNum = 1;
        setPageNum(pageNum);
        list = [];
        setList([...list]);
        reviewQuests = [];
        setReviewQuests([...reviewQuests]);
    }

    useEffect(() => {
        data && init();
    }, [data]);

    useImperativeHandle(ref, () => ({
        confirm,
        isOver,
        clearList
    }));

    return (
        <div className="judg-content">
            <h1>{selectOpenQs?.challenge_title}</h1>
            <Spin spinning={loading}>
                <div className="judg-info">
                    <div className="item item-flex">
                        <p className="item-title">{t("challenger")}:</p>
                        <div className="item-content">
                            <a href={`/user/${selectOpenQs?.address}`} target="_blank">{NickName(selectOpenQs?.address)}</a>
                        </div>
                    </div>

                    <div className="item item-flex">
                        <p className="item-title">{t("submit-time")}:</p>
                        <div className="item-content">
                            <p>{timestamp(selectOpenQs?.updated_at)}</p>
                        </div>
                    </div>

                    <div className="item item-flex">
                        <p className="item-title">{t("quest")}:</p>
                        <div className="item-content">
                            <Viewer value={selectOpenQs?.title} />
                        </div>
                    </div>

                    <div className="item">
                        <p className="item-title">{t("ans")}:</p>
                            <TextArea 
                                readOnly
                                className="item-content box" 
                                value={selectOpenQs?.answer?.value}
                                maxLength={2000}
                                autoSize={{ minRows: 7 }}
                            />
                    </div>

                    <div className="item">
                        <p className="item-title">{t("tips")}:</p>
                            <TextArea 
                                className="item-content box" 
                                style={{backgroundColor: "transparent"}}
                                value={selectOpenQs?.annotation || selectOpenQs.answer?.annotation}
                                onChange={(e) => setAnnotation(e.target.value)}
                                maxLength={2000}
                                autoSize={{ minRows: 7 }}
                            />
                    </div>
                    <div className="item">
                        <p className="item-title">{t("annex")}:</p>
                        <div className="item-content">
                            {selectOpenQs.answer?.annex.map((e) => (
                                <Button
                                    type="link"
                                    key={e.name}
                                    onClick={() => download(e.hash, e.name)}
                                >
                                    {e.name}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="item item-flex">
                        <p className="item-title">{t("c-total")}:</p>
                        <div className="item-content">
                            <p>{(list[page]?.answer?.score ? list[page]?.user_score : rateCache?.score ? list[page]?.user_score + rateCache.score : "")}</p>
                        </div>
                    </div>

                    <div className="item item-flex">
                        <p className="item-title">{t("c-pass")}:</p>
                        <div className="item-content">
                            <p>{list[page]?.pass_score}</p>
                        </div>
                    </div>

                    <div className="item mb40">
                        <div className="item-title">
                            <div>
                                {t("score")}: 
                                <InputNumber
                                    disabled={!onFinish}
                                    min={0}
                                    max={list[page]?.score}
                                    style={{
                                        margin: '0 16px',
                                    }}
                                    step={list[page]?.score / 10}
                                    value={list[page]?.answer?.score ? list[page].answer?.score : rateCache?.score ? rateCache.score : ""}
                                    onChange={(value) => setPercent(value / (list[page]?.score / 10) / 2)}
                                />
                                
                            </div>
                            <div style={{width: "352px"}}>
                                <Slider 
                                    disabled={!onFinish}
                                    max={5}
                                    step={0.5}
                                    tooltip={{
                                        formatter: null,
                                    }}
                                    value={
                                        selectOpenQs.answer?.correct
                                            ? selectOpenQs?.score
                                            : selectOpenQs?.rate
                                            ? selectOpenQs.rate
                                            : (selectOpenQs.answer?.score /
                                                  selectOpenQs?.score) * 5
                                    }
                                    onChange={(percent) => setPercent(percent)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Spin>
            {total && (
                <>
                    <div className="pagination">
                        <Button
                            disabled={page === 0}
                            onClick={() => changePage(page - 1)}
                        >
                            {t("prev")}
                        </Button>
                        <p>
                            {page + 1}/
                            <span style={{ color: "#8B8D97" }}>{total}</span>
                        </p>
                        <Button
                            disabled={page + 1 === total}
                            onClick={() => changePage(page + 1)}
                        >
                            {t("next")}
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}

export default forwardRef(RatingModal);
