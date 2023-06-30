import {
    ArrowLeftOutlined,
    ExportOutlined
} from '@ant-design/icons';
import { 
    Button, 
    message, 
    Progress 
} from 'antd';
import { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { challengeJson, getQuests, nftJson, submitChallenge } from "../../request/api/public";
import "@/assets/styles/view-style/challenge.scss"
import "@/assets/styles/mobile/view-style/challenge.scss"
import CustomPagination from '../../components/CustomPagination';
import ModalAnswers from '../../components/CustomModal/ModalAnswers';
import { 
    CustomRadio, 
    CustomInput, 
    CustomCheckbox 
} from '../../components/CustomChallenge';
import { useTranslation } from 'react-i18next';
import { usePublish } from '@/hooks/usePublish';
import { setMetadata } from '@/utils/getMetadata';
import CustomCode from '@/components/CustomChallenge/CustomCode';
import store from "@/redux/store";
import MyContext from '@/provider/context';

export default function Challenge(params) {

    const { t } = useTranslation(["explore"]);

    // const reduxCache = useContext(MyContext);
    const { questId } = useParams();
    const location = useLocation();
    const navigateTo = useNavigate();
    const childRef = useRef(null);
    let [detail, setDetail] = useState();
    let [cacheDetail, setCacheDetail] = useState();
    let [answers, setAnswers] = useState([]);
    let [percent, setPercent] = useState();
    let [publishObj, setPublishObj] = useState({});
    const { publish: write, isLoading, transactionLoading } = usePublish({
        jsonHash: publishObj?.jsonHash, 
        recommend: publishObj?.recommend
    });

    let [page, setPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const index = page-1;

    const openAnswers = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const checkPage = async(type) => {
        window.scrollTo(0, 0);
        // 不是预览模式才运行: 切换page前运行
        if (detail) {
            const questType = detail.metadata.properties.questions[page-1].type;
            if (questType === "special_judge_coding" || questType === "coding") {
                childRef.current.goTest()
                .then(() => {
                    saveAnswer();
                })
            }
        }
        page = type === 'add' ? page+1 : page-1;
        setPage(page);
    }

    const changePage = (index) => {
        page = index;
        setPage(page);
    }

    const getData = async (id) => {
        const res = await getQuests({id: id});
        setMetadata(res.data)
        .then(res => {
            detail = res ? res : {};
            setDetail({...detail});
            // 获取本地存储 ===> 
            const local = JSON.parse(localStorage.getItem("decert.cache"));
            const cacheAnswers = local ? local : null;
            let flag = false;
            if (cacheAnswers[id]) {
                // 存在该题cache
                answers = cacheAnswers[id];
                // 旧版本cache升级
                try {
                    answers.forEach(e => {
                        // 锁定旧版本普通题
                        if (
                            typeof e === "string" || 
                            typeof e === "number" || 
                            Array.isArray(e)
                        ) {
                            throw ""
                        }
                    })
                } catch (err) {
                    answers.map((e, i) => {
                        let type;
                        if (typeof e === "string") {
                            type = "fill_blank"
                        }else if (typeof e === "number") {
                            type = "multiple_choice"
                        }else{
                            type = "multiple_response"
                        }
                        answers[i] = {
                            value: e,
                            type: type
                        }
                    })
                    setAnswers([...answers])
                    cacheAnswers[id] = answers;
                    localStorage.setItem("decert.cache", JSON.stringify(cacheAnswers));
                }
                try {
                    answers.forEach((e,i) => {
                        if (e === null) {
                            page = i+1;
                            setPage(page)
                            throw ""
                        }
                    })
                } catch (err) {
                    flag = true;
                }
                if (page === 1 && !flag) {
                    page = answers.length;
                    setPage(page)
                }
            }else{
                answers = new Array(Number(detail.metadata.properties.questions.length)).fill(undefined);
                cacheAnswers[id] = answers;
                saveAnswer()
            }
            setAnswers([...answers])
        })
    }

    const changeAnswer = (value, type) => {
        // 新版普通题cache添加 ===> TODO:
        answers[index] = {
            value: value,
            type: type
        }
        setAnswers([...answers]);
    }

    const saveAnswer = () => {
        let cache = JSON.parse(localStorage.getItem("decert.cache"));
        cache[detail.tokenId] = answers;
        localStorage.setItem("decert.cache", JSON.stringify(cache)); 
    }

    const submit = async() => {
        childRef.current &&
        await childRef.current.goTest()
        // 本地 ==> 存储答案 ==> 跳转领取页
        saveAnswer()
        // 提交答题次数给后端
        await submitChallenge({
            token_id: detail.tokenId,
            answer: JSON.stringify(answers)
        })
        navigateTo(`/claim/${detail.tokenId}`)
    }

    const publish = () => {
        const local = JSON.parse(localStorage.getItem("decert.store"))
        if (!local.isOver) {
            message.error(t("message.error.publish"));
            return
        }else{
            write();
        }
    }

    const cacheInit = async() => {
        const { challenge } = store.getState();
        const local = localStorage.getItem("decert.store");
        if (!challenge && (!local || (local && JSON.parse(local).questions.length === 0))) {
            navigateTo("/challenges");
            return
        }
        const cache = challenge || JSON.parse(local);

        if (cache.isOver) {
            const challengeHash = await challengeJson(cache.hash.attributes.challenge_ipfs_url);
            const obj = JSON.parse(JSON.stringify(cache.hash));
            obj.attributes.challenge_ipfs_url = challengeHash.data.hash;
            const jsonHash = await nftJson(obj);
            publishObj = {
                jsonHash: jsonHash.data.hash,
                recommend: cache.recommend
            }
            setPublishObj({...publishObj});
        }
            cacheDetail = cache.hash;
            setCacheDetail({...cacheDetail});
            answers = new Array(Number(cache.questions.length))
            setAnswers([...answers])
    }

    useEffect(() => {
        if (location.pathname === "/preview") {
            // 预览模式
            cacheInit();
        }else{
            // 挑战模式
            getData(questId);
        }
    }, []);

    useEffect(() => {
        // 修改进度条
        if (detail || cacheDetail) {
            const total = detail?.metadata.properties.questions.length ? detail?.metadata.properties.questions.length : cacheDetail.attributes.challenge_ipfs_url.questions.length;
            percent = page === total ? 100 : (100/ total) * page;
            setPercent(percent);
        }
    },[page, detail, cacheDetail])

    function topic(params) {
        return (
            params.map((e,i) => {
                return i === index && (
                    <div key={i} className={`content ${e.type === "coding" ? "h-a" : ""}`}>
                        {
                            e.type !== "coding" &&
                            <h4 className='challenge-title'>{t("challenge.title")}
                                #{page}
                            </h4>
                        }
                        {switchType(e,i)}
                    </div>
                )
            })
        )
    }

    const switchType = (question,i) => {
        // 2: 填空 0: 单选 1: 多选
        switch (question.type) {
            case "coding":
            case "special_judge_coding":
                // 编码
                return <CustomCode 
                    key={i} 
                    question={question} 
                    token_id={questId} 
                    ref={childRef} 
                    answers={answers}
                    setAnswers={setAnswers}
                    saveAnswer={saveAnswer}
                    index={page-1}
                    isPreview={cacheDetail ? true : false}
                />
            case 2:
            case "fill_blank":
                return <CustomInput key={i} label={question.title} value={changeAnswer} defaultValue={answers[i]} />
            case 1:
            case "multiple_response":
                return <CustomCheckbox key={i} label={question.title} options={question.options} value={changeAnswer} defaultValue={answers[i]} />
            case 0:
            case "multiple_choice":
                return <CustomRadio key={i} label={question.title} options={question.options} value={changeAnswer} defaultValue={answers[i]} />
            default:
                break;
        }
        return
    }

    return (
        
        <div className="Challenge">
            {
                (detail || cacheDetail) &&
                <>
                    {
                        detail ?
                        <>
                            <ModalAnswers
                                isModalOpen={isModalOpen}
                                handleCancel={handleCancel}
                                submit={submit}
                                answers={answers}
                                changePage={changePage}
                                detail={detail}
                            />
                            <div className='quest-title' style={{display: "flex"}}>
                                    <div className="title">
                                        <Link to={`/quests/${detail.tokenId}`}>
                                            <ArrowLeftOutlined />
                                        </Link>
                                        <Link to={`/quests/${detail.tokenId}`}>
                                            <p>{detail?.title}</p>
                                        </Link>
                                    </div>
                            </div>
                        </>
                        :
                        <>
                        <div className="preview-head">
                            {t("mode-preview")}
                            <div className="btns">
                                <Button loading={isLoading || transactionLoading} onClick={() => publish()}>
                                    {t("btn-publish")}
                                </Button>
                                <Button className="btn-exit" onClick={() => {navigateTo("/publish")}}>
                                    <ExportOutlined className='icon' />
                                    {t("btn-exit")}
                                </Button>
                            </div>
                        </div>
                        </>
                    }
                    {
                        detail ? topic(detail.metadata.properties.questions)
                        : topic(cacheDetail.attributes.challenge_ipfs_url.questions)
                    }
                    <div className="progress">
                        <Progress strokeLinecap="butt" percent={percent} showInfo={false} />
                    </div>
                    <CustomPagination
                        type={detail ? "write" : "preview"}
                        page={page} 
                        total={
                            detail ?
                            detail.metadata.properties.questions.length
                            :
                            cacheDetail.attributes.challenge_ipfs_url.questions.length
                        } 
                        onChange={checkPage} 
                        openAnswers={openAnswers}
                        submit={submit}
                        isPreview={cacheDetail ? true : false}
                    />
                </>
            }
        </div>
    )
}