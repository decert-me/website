import {
    ArrowLeftOutlined,
    ExportOutlined
} from '@ant-design/icons';
import { 
    Button, 
    Modal, 
    Progress 
} from 'antd';
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { getQuests, submitChallenge } from "../../request/api/public";
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
import { setMetadata } from '@/utils/getMetadata';
import CustomCode from '@/components/CustomChallenge/CustomCode';
import store from "@/redux/store";
import { localRealAnswerInit } from '@/utils/localRealAnswerInit';
import { modalNotice } from '@/utils/modalNotice';
import { Encryption } from '@/utils/Encryption';

export default function Challenge(params) {

    const { t } = useTranslation(["explore", "translation"]);

    const { questId } = useParams();
    const location = useLocation();
    const navigateTo = useNavigate();
    const childRef = useRef(null);
    let [detail, setDetail] = useState();
    let [cacheDetail, setCacheDetail] = useState();
    let [answers, setAnswers] = useState([]);
    let [percent, setPercent] = useState();
    let [isEdit, setIsEdit] = useState();   //  修改challenge预览
    let [isPreview, setIsPreview] = useState();
    const { decode } = Encryption();
    const key = process.env.REACT_APP_ANSWERS_KEY;
    let [realAnswer, setRealAnswer] = useState([]);

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
        try {
            const res = await getQuests({id: id});
            setMetadata(res.data)
            .then(res => {
                detail = res ? res : {};
                setDetail({...detail});
                // 获取本地存储 ===> 
                const local = JSON.parse(localStorage.getItem("decert.cache"));
                let cacheAnswers = local ? local : null;
                let flag = false;
                
                const { cacheAnswers: newAnswers } = localRealAnswerInit({
                    cacheAnswers, id, detail, reload: () => {
                        // TODO: 弹窗提示 ===> 跳转
                        Modal.warning({
                            ...modalNotice({
                                t, 
                                text: t("translation:message.error.challenge-modify"), 
                                onOk: () => {navigateTo(0)},
                                icon: "🤖"
                            }
                        )});
                    }
                })
                cacheAnswers = newAnswers
    
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
        } catch (error) {
            navigateTo("/404")
        }
    }

    const changeAnswer = (value, type) => {
        // 新版普通题cache添加
        const obj = {
            value: value,
            type: type
        }
        changeAnswersValue(obj, index)
    }

    const saveAnswer = () => {
        let cache = JSON.parse(localStorage.getItem("decert.cache"));
        console.log("local ===>", cache[detail.tokenId]);
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

    const cacheInit = async() => {
        const { challenge } = store.getState();
        const local = localStorage.getItem("decert.store");
        if (!challenge && (!local || (local && JSON.parse(local).questions.length === 0))) {
            navigateTo("/challenges");
            return
        }
        const cache = challenge || JSON.parse(local);
        setIsPreview(true);
        isEdit = challenge;
        setIsEdit(isEdit);
        cacheDetail = cache.hash;
        setCacheDetail({...cacheDetail});
        answers = new Array(Number(cache.questions.length))
        setAnswers([...answers])
        realAnswer = eval(decode(key, cacheDetail.attributes.challenge_ipfs_url.answers));
        setRealAnswer([...realAnswer]);
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
                                #{page} &nbsp;&nbsp; 
                                {
                                    isEdit && 
                                    <span className="score">({e.score}分)</span>
                                }
                            </h4>
                        }
                        {switchType(e,i)}
                    </div>
                )
            })
        )
    }

    function changeAnswersValue(value, index) {
        let cache = JSON.parse(localStorage.getItem("decert.cache"));
        cache[detail.tokenId][index] = value;
        localStorage.setItem("decert.cache", JSON.stringify(cache)); 
        answers = cache[detail.tokenId];
        setAnswers([...answers]);
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
                    setAnswers={changeAnswersValue}
                    saveAnswer={saveAnswer}
                    index={page-1}
                    isPreview={isPreview}
                />
            case 2:
            case "fill_blank":
                return (
                    <CustomInput 
                        key={i} 
                        label={question.title} 
                        value={changeAnswer} 
                        defaultValue={answers[i]} 
                        isPreview={isPreview}
                        answer={realAnswer[i]}
                    />
                )
            case 1:
            case "multiple_response":
                return (
                    <CustomCheckbox 
                        key={i} 
                        label={question.title} 
                        options={question.options} 
                        value={changeAnswer}
                        defaultValue={answers[i]} 
                        isPreview={isPreview}
                        answer={realAnswer[i]}
                    />
                )
            case 0:
            case "multiple_choice":
                console.log();
                return (
                    <CustomRadio 
                        key={i} 
                        label={question.title} 
                        options={question.options} 
                        value={changeAnswer} 
                        defaultValue={answers[i]} 
                        isPreview={isPreview}
                        answer={realAnswer[i]}
                    />
                ) 
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
                    <ModalAnswers
                        isModalOpen={isModalOpen}
                        handleCancel={handleCancel}
                        submit={submit}
                        answers={answers}
                        changePage={changePage}
                        detail={detail}
                        isPreview={cacheDetail ? true : false}
                    />
                    <div className='quest-title' style={{display: "flex"}}>
                            <div className={`title ${cacheDetail ? "line" : ""}`}>
                                {
                                    detail?.tokenId ? 
                                    <>
                                        <Link to={`/quests/${detail.tokenId}`}>
                                            <ArrowLeftOutlined />
                                        </Link>
                                        <Link to={`/quests/${detail.tokenId}`}>
                                            <p>{detail?.title}</p>
                                        </Link>
                                    </>
                                    :
                                    <>
                                        {/* 预览模式 */}
                                        <ArrowLeftOutlined />
                                        <p>{cacheDetail?.name}</p>
                                    </>
                                }
                            </div>
                    </div>
                    {
                        cacheDetail &&
                        <div className="preview-head">
                            <p>{t("mode-preview")}</p>
                            <Button className="btn-exit" onClick={() => {isEdit ? navigateTo(`/publish?${isEdit.changeId}`) : navigateTo("/publish")}}>
                                <ExportOutlined className='icon' />
                                {t("btn-exit")}
                            </Button>
                        </div>
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