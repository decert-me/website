import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Button, Rate, Spin, Tour, Input } from "antd";
import { Viewer } from "@bytemd/react";
import { download } from "@/utils/file/download";
import { GetPercentScore } from "@/utils/GetPercent";
import {
    getUserOpenQuestDetailList,
    reviewOpenQuest,
} from "@/request/api/judg";
import CustomIcon from "@/components/CustomIcon";
import { NickName } from "@/utils/NickName";

const { TextArea } = Input;

function RatingModal({ data, isMobile, onFinish }, ref) {
    const star = useRef(null);
    const { t } = useTranslation(["rate", "translation"]);
    const [open, setOpen] = useState(false); //  漫游引导展示
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState();
    let [list, setList] = useState([]);

    let [reviewQuests, setReviewQuests] = useState([]);
    let [selectOpenQs, setSelectOpenQs] = useState({});
    let [page, setPage] = useState(0);
    let [pageNum, setPageNum] = useState(1);

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
                            marginTop: "-40px",
                        }}
                    />
                    <Button
                        className="custom-ikonw"
                        ghost
                        onClick={() => setOpen(false)}
                    >
                        {t("translation:btn-ok")}
                    </Button>
                </div>
            ),
            target: () => star.current,
        },
    ];

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

        // 判断是否是第一次进入该页面 => 提示如何评分动画
        const isFrist = localStorage.getItem("decert.rate");
        if (!isFrist) {
            setTimeout(() => {
                setOpen(true);
                localStorage.setItem("decert.rate", true);
            }, 500);
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
    }

    function getScore(percent) {
        // 记录rate
        list[page].rate = percent;
        setList([...list]);
        selectOpenQs.rate = percent;
        setSelectOpenQs({ ...selectOpenQs });

        // 已打分列表
        const p = (percent * 20) / 100;
        const info = list[page];
        const score = GetPercentScore(info.score, p);
        const obj = {
            id: info.ID,
            answer: {
                type: "open_quest",
                annex: selectOpenQs.answer.annex,
                value: selectOpenQs.answer.value,
                score: score,
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
                                autoSize={{
                                    minRows: 7,
                                }}
                                placeholder={t("inner.text")}
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

                    <div className="item mb40">
                        <div className="item-title flex">
                            {t("score")}:
                            <div ref={star}>
                                <Rate
                                    allowHalf
                                    disabled={!onFinish} //  预览模式不可选
                                    value={
                                        selectOpenQs.answer?.correct
                                            ? selectOpenQs?.score
                                            : selectOpenQs?.rate
                                            ? selectOpenQs.rate
                                            : (selectOpenQs.answer?.score /
                                                  selectOpenQs?.score) *
                                              5
                                    }
                                    style={{ color: "#DD8C53" }}
                                    character={
                                        <CustomIcon
                                            type="icon-star"
                                            className="icon"
                                        />
                                    }
                                    onChange={(percent) => getScore(percent)}
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
                    <Tour
                        rootClassName={`custom-tour ${
                            isMobile ? "mobile-custom-tour" : ""
                        }`}
                        open={open}
                        steps={steps}
                        closeIcon={<></>}
                        placement="bottomLeft"
                    />
                </>
            )}
        </div>
    );
}

export default forwardRef(RatingModal);
