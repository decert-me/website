import "@/assets/styles/view-style/challenge.scss"
import "@/assets/styles/mobile/view-style/challenge.scss"
import store from "@/redux/store";
import i18n from 'i18next';
import { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import { Button, Modal, Progress, message } from 'antd';
import { ArrowLeftOutlined, ExportOutlined, CloseOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { getQuests, submitChallenge } from "../../request/api/public";
import { CustomRadio, CustomInput, CustomCheckbox, CustomOpen, CustomCode } from '../../components/CustomChallenge/QuestType';
import { setMetadata } from '@/utils/getMetadata';
import { localRealAnswerInit } from '@/utils/localRealAnswerInit';
import { modalNotice } from '@/utils/modalNotice';
import { getDataBase } from '@/utils/saveCache';
import CustomPagination from '../../components/CustomPagination';
import ModalAnswers from '../../components/CustomModal/ModalAnswers';
import { useAddress } from "@/hooks/useAddress";
import { useUpdateEffect } from "ahooks";
import MyContext from "@/provider/context";
import { shuffle } from "@/utils/shullfe";

export default function Challenge(params) {

    const { t } = useTranslation(["explore", "translation"]);

    const { isConnected, address: userAddress } = useAddress();
    const { questId } = useParams();
    const location = useLocation();
    const navigateTo = useNavigate();
    const childRef = useRef(null);
    const { isMobile, connectWallet, connectMobile } = useContext(MyContext);
    const [loading, setLoading] = useState(false);
    let [detail, setDetail] = useState();
    let [cacheDetail, setCacheDetail] = useState();
    let [answers, setAnswers] = useState([]);
    let [percent, setPercent] = useState();
    let [isEdit, setIsEdit] = useState();   //  修改challenge预览
    let [isPreview, setIsPreview] = useState();
    let [realAnswer, setRealAnswer] = useState([]);
    let [questKey, setQuestKey] = useState(100);

    // 地址验证相关状态
    const [showAddressMismatchModal, setShowAddressMismatchModal] = useState(false);

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

    function messUpArr(arr) {
        arr.forEach(item => {
            if (item.type === 1 || item.type === 0 || item.type === "multiple_response" || item.type === "multiple_choice") {
                let arr = [];
                item.options.map((e,i) => {
                    arr.push({
                        label: e,
                        value: i
                    })
                })
                const radioOption = shuffle(arr);
                item.options = radioOption;
            }
        })
        return arr;
    }

    const getData = async (id) => {
        let res = {};
        await getQuests({id})
        .then(result => {
            res = JSON.parse(JSON.stringify(result));
        })

        if (res.data.status === 2) {
            navigateTo("/404")
            return
        }
        try {

            await setMetadata(res.data)
            .then(res => {
                detail = res ? res : {};
                // TODO: 打乱选项顺序
                detail.metadata.properties.questions = messUpArr(detail.metadata.properties.questions);
                setDetail({...detail});
                // 获取本地存储 ===> 
                const local = JSON.parse(localStorage.getItem("decert.cache"));
                let cacheAnswers = local || {};
                let flag = false;
                
                const { cacheAnswers: newAnswers } = localRealAnswerInit({
                    cacheAnswers, id, detail, reload: () => {
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
                if (cacheAnswers[id] || detail?.answer) {
                    // 存在该题cache
                    answers = detail?.answer || cacheAnswers[id];
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
            const {search} = location;
            const searchPage = Number(search.slice(1,search.length))
            if (search && searchPage !== 0) {
                changePage(searchPage)
            }
        } catch (error) {
            navigateTo("/404")
        }
    }

    const changeAnswer = (value, type, annex) => {
        // 新版普通题cache添加
        const obj = annex ? { value, type, annex } : { value, type };
        !isPreview && changeAnswersValue(obj, index)
    }

    const saveAnswer = () => {
        let cache = JSON.parse(localStorage.getItem("decert.cache"));
        cache[detail.uuid] = answers;
        localStorage.setItem("decert.cache", JSON.stringify(cache)); 
    }

    const submit = async() => {
        childRef.current &&
        await childRef.current.goTest()

        // 检查是否有编程题
        const codingQuestions = detail.metadata.properties.questions.filter(
            (question, idx) => question.type === "coding" || question.type === "special_judge_coding"
        );

        if (codingQuestions.length > 0) {
            // 检查对应的答案
            const codingAnswers = codingQuestions.map((q, idx) => {
                // 找到对应的答案索引
                const answerIndex = detail.metadata.properties.questions.findIndex(question => question === q);
                return { answer: answers[answerIndex], index: answerIndex };
            });

            // 检查是否有编程题未提交 AI 判题
            const notSubmitted = codingAnswers.filter(({ answer }) => !answer || answer.correct === undefined);

            if (notSubmitted.length > 0) {
                Modal.warning({
                    title: "无法提交",
                    content: "您有编程题尚未提交代码进行 AI 判题，请先点击【提交代码】按钮。",
                    okText: "确定",
                    centered: true
                });
                return;
            }

            // 检查是否有编程题未通过 AI 判题
            const failedCodingQuestions = codingAnswers.filter(({ answer }) => answer.correct === false);

            if (failedCodingQuestions.length > 0) {
                Modal.warning({
                    title: "无法提交",
                    content: "您有编程题未通过 AI 判题，请修改代码后重新提交。",
                    okText: "确定",
                    centered: true
                });
                return;
            }
        }

        // 是否有开放题 ? 查看是否已经提交过答案 : 跳转至claim页
        const isOpenQuest = answers.filter(answer => answer?.type === "open_quest");
        // 有开放题的同时未登录
        if (isOpenQuest.length !== 0 && !isConnected) {
            if (isMobile) {
                connectMobile();
            }else{
                connectWallet();
            }
            return
        }
        if (isOpenQuest.length !== 0 && detail.open_quest_review_status !== 0) {
            const newAns = answers.map(obj => {
                if (obj) {
                    let newObj = { ...obj };
                    delete newObj.score;
                    delete newObj.open_quest_review_time;
                    delete newObj.correct;
                    delete newObj.annotation;
                    return newObj;
                }else{
                    return null;
                }
            })
            // 展示覆盖弹窗
            Modal.confirm({
                title: "",
                className: "isCover",
                icon: <></>,
                centered: true,
                cancelText: t("translation:btn-cancel"),
                okText: t("translation:btn-confirm"),
                onOk: () => {
                    saveAnswer()
                    submitChallenge({
                        token_id: detail.tokenId,
                        answer: JSON.stringify(newAns),
                        uri: detail.uri
                    }).then(res => {
                        message.success(t("translation:message.success.submit.info"));
                        navigateTo(`/claim/${detail.uuid}`)
                    })
                },
                content: (
                    <>
                        <CloseOutlined onClick={() => Modal.destroyAll()} />
                        <p className="confirm-title">{t("confirm.title")}</p>
                        <p className="confirm-content">{t("confirm.content")}</p>
                    </>
                )
            })
            return
        }
        // 本地 ==> 存储答案 ==> 跳转领取页
        saveAnswer()
        // 提交答题次数给后端
        setLoading(true);
        delete answers.annotation;
        await submitChallenge({
            token_id: detail.tokenId,
            answer: JSON.stringify(answers),
            uri: detail.uri
        })
        setLoading(false);
        message.success(t("translation:message.success.submit.info"));
        navigateTo(`/claim/${detail.uuid}`)
    }

    // 获取预览内容
    const cacheInit = async() => {
        // 判断当前search栏是否有token_id ? 获取editChallenge : 获取publish
        const tokenId = location.search.replace("?","");
        // 判断是否是 发布预览 => publish || 修改挑战预览 => store
        let data;
        if (tokenId) {
            const { challenge } = await store.getState();
            data = [challenge]
        }else{
            data = await getDataBase("publish");
        }

        // 没有缓存 || 编辑tokenid不一致 返回挑战列表c
        if (data.length === 0 || (tokenId && data[0].token_id !== tokenId)) {
            navigateTo("/challenges");
            return
        }

        const cache = data[0];
        setIsEdit(true);
        setIsPreview(true);
        cacheDetail = cache;
        cacheDetail.questions = messUpArr(cacheDetail.questions);
        setCacheDetail({...cacheDetail});
        answers = new Array(Number(cache.questions.length))
        setAnswers([...answers])
        realAnswer = cache.questions.map(quest => quest.answers);
        setRealAnswer([...realAnswer]);
    }

    // 地址验证逻辑：检查 URL 中的 address 参数与用户登录地址是否一致
    useEffect(() => {
        // 从 URL 参数中获取 address
        const searchParams = new URLSearchParams(location.search);
        const urlAddress = searchParams.get('address');

        // 只有当 URL 中包含 address 参数时才进行验证
        if (urlAddress && isConnected && userAddress) {
            // 比较地址（不区分大小写）
            if (urlAddress.toLowerCase() !== userAddress.toLowerCase()) {
                // 地址不一致，显示弹窗
                setShowAddressMismatchModal(true);
            }
        }
    }, [isConnected, userAddress, location.search]);

    useUpdateEffect(() => {
        // 挑战模式
        if (location.pathname !== "/preview") {
            // 切换语种
            reload();
        }
    },[i18n.language])

    async function reload(isClear, index) {
        const oldPage = page;
        await getData(questId);
        if (isClear) {
            answers[index] = null;
            setAnswers([...answers]);
        }
        page = oldPage;
        setPage(page);
        questKey = questKey+100;
        setQuestKey(questKey);
    }

    useEffect(() => {
        if (location.pathname.indexOf("/preview") !== -1) {
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
            const total = detail?.metadata.properties.questions.length ? detail?.metadata.properties.questions.length : cacheDetail.questions.length;
            percent = page === total ? 100 : (100/ total) * page;
            setPercent(percent);
        }
    },[page, detail, cacheDetail])

    function questTye(type) {
        switch (type) {
            case "open_quest":
                return `(${t("ques.open")})`
            case "fill_blank":
                return `(${t("ques.fill")})`
            case "multiple_choice":
                return `(${t("ques.radio")})`
            case "multiple_response":
                return `(${t("ques.select")})`
            default:
                break;
        }
    }

    function topic(params) {
        return (
            params.map((e,i) => {
                return i === index && (
                    <div key={i} className={`content ${e.type === "coding" ? "h-a" : ""}`}>
                        {
                            e.type !== "coding" &&
                            <h4 className='challenge-title'>{t("challenge.title")}
                                #{page} 
                                {/* {questTye(e.type)}&nbsp;&nbsp;  */}
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
        answers[index] = value;
        cache[detail.uuid] = answers;
        localStorage.setItem("decert.cache", JSON.stringify(cache)); 
        setAnswers([...answers]);
    }

    const switchType = (question,i) => {
        // 2: 填空 0: 单选 1: 多选
        switch (question.type) {
            case "coding":
            case "special_judge_coding":
                // 编码
                return <CustomCode 
                    key={questKey+i} 
                    question={question} 
                    token_id={questId} 
                    ref={childRef} 
                    answers={answers}
                    setAnswers={changeAnswersValue}
                    saveAnswer={saveAnswer}
                    index={page-1}
                    isPreview={isPreview}
                    reload={reload}
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
                        isPreview={isPreview}
                        answer={realAnswer[i]}
                        defaultValue={answers[i]} 
                    />
                )
            case 0:
            case "multiple_choice":
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
            case "open_quest":
                const fileList = [];
                if (answers[i]) {
                    const {annex} = answers[i];
                    annex?.forEach((file, i) => {
                        fileList.push({
                            uid: i,
                            name: file.name,
                            status: 'done',
                            url: file.hash,
                        })
                    })
                }
                return (
                    <CustomOpen 
                        key={i} 
                        label={question.title} 
                        question={question} 
                        value={changeAnswer} 
                        defaultValue={detail?.answer ? detail.answer[i] : null} 
                        defaultFileList={fileList}
                        isPreview={isPreview}
                        // answer={realAnswer[i]}
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
                                    detail?.uuid ? 
                                    <>
                                        <Link to={`/quests/${detail.uuid}`}>
                                            <ArrowLeftOutlined />
                                        </Link>
                                        <Link to={`/quests/${detail.uuid}`}>
                                            <p>{detail?.title}</p>
                                        </Link>
                                    </>
                                    :
                                    <>
                                        {/* 预览模式 */}
                                        <ArrowLeftOutlined />
                                        <p>{cacheDetail?.title}</p>
                                    </>
                                }
                            </div>
                    </div>
                    {
                        cacheDetail &&
                        <div className="preview-head">
                            <p>{t("mode-preview")}</p>
                            <Button className="btn-exit" onClick={() => {cacheDetail?.token_id ? navigateTo(`/publish?${cacheDetail.token_id}`) : navigateTo("/publish")}}>
                                <ExportOutlined className='icon' />
                                {t("btn-exit")}
                            </Button>
                        </div>
                    }
                    {
                        detail ? topic(detail.metadata.properties.questions)
                        : topic(cacheDetail.questions)
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
                            cacheDetail.questions.length
                        } 
                        onChange={checkPage} 
                        openAnswers={openAnswers}
                        submit={submit}
                        loading={loading}
                        isPreview={cacheDetail ? true : false}
                    />
                </>
            }

            {/* 地址不一致提示弹窗 */}
            <Modal
                title="地址不一致提示"
                open={showAddressMismatchModal}
                onOk={() => setShowAddressMismatchModal(false)}
                onCancel={() => setShowAddressMismatchModal(false)}
                okText="我知道了"
                cancelButtonProps={{ style: { display: 'none' } }}
            >
                <p>您当前在 DeCert 登录的钱包地址与登链社区的钱包地址不一致，请重新绑定。</p>
            </Modal>
        </div>
    )
}