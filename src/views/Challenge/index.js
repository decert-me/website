import {
    ArrowLeftOutlined,
    ExportOutlined
} from '@ant-design/icons';
import { 
    Button, 
    message, 
    Progress 
} from 'antd';
import { useEffect, useMemo, useState } from "react";
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
import axios from "axios";
import { constans } from '@/utils/constans';
import pluginGfm from '@bytemd/plugin-gfm'
import frontmatter from '@bytemd/plugin-frontmatter'
import highlight from '@bytemd/plugin-highlight-ssr'
import breaks from '@bytemd/plugin-breaks'
import { usePublish } from '@/hooks/usePublish';
import ModalConnect from '@/components/CustomModal/ModalConnect';

export default function Challenge(params) {

    const { t } = useTranslation(["explore"]);
    const plugins = useMemo(() => [pluginGfm(),frontmatter(),highlight(),breaks()], [])

    const { ipfsPath } = constans();
    const { questId } = useParams();
    const location = useLocation();
    const navigateTo = useNavigate();
    let [detail, setDetail] = useState();
    let [cacheDetail, setCacheDetail] = useState();
    let [answers, setAnswers] = useState([]);
    let [percent, setPercent] = useState();
    let [publishObj, setPublishObj] = useState({});
    const { publish: write, signIn, isLoading, transactionLoading, cancelModalConnect } = usePublish({
        jsonHash: publishObj?.jsonHash, 
        recommend: publishObj?.recommend
    });

    let [page, setPage] = useState(1);
    const index = page-1;



    const [isModalOpen, setIsModalOpen] = useState(false);

    const openAnswers = () => {
        setIsModalOpen(true);
    };

    

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const checkPage = (type) => {
        window.scrollTo(0, 0);
        page = type === 'add' ? page+1 : page-1;
        setPage(page);
        saveAnswer()
    }

    const changePage = (index) => {
        page = index;
        setPage(page);
    }

    const getData = (id) => {
        getQuests({id: id})
        .then(res => {
            detail = res ? res.data : {};
            setDetail({...detail});
            // 获取本地存储 ===> 
            const local = JSON.parse(localStorage.getItem("decert.cache"));
            const cacheAnswers = local ? local : null;
            if (cacheAnswers[id]) {
                // 存在该题cache
                answers = cacheAnswers[id];
                try {
                    answers.forEach((e,i) => {
                        if (e === null) {
                            page = i+1;
                            setPage(page)
                            throw ""
                        }
                    })
                } catch (err) {
                }
                if (page === 1) {
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

    const changeAnswer = (e) => {
        answers[index] = e;
        setAnswers([...answers]);
    }

    const saveAnswer = () => {
        let cache = JSON.parse(localStorage.getItem("decert.cache"));
        cache[detail.tokenId] = answers;
        localStorage.setItem("decert.cache", JSON.stringify(cache)); 
    }

    const submit = async() => {
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
        const local = localStorage.getItem("decert.store");
        if (!local || (local && JSON.parse(local).questions.length === 0)) {
            navigateTo("/challenges");
            return
        }
        const cache = JSON.parse(local);
        publishObj = {
            jsonHash: cache.hash,
            recommend: cache.recommend
        }
        setPublishObj({...publishObj});
        const request = await axios.get(`${ipfsPath}/${cache.hash}`)
        cacheDetail = request.data;
        setCacheDetail({...cacheDetail});

        answers = new Array(Number(cache.questions.length))
        setAnswers([...answers])
    }

    useEffect(() => {
        if (location.pathname === "/preview") {
            cacheInit();
        }else{
            getData(questId);
        }
    }, []);

    useEffect(() => {
        // 修改进度条
        if (detail || cacheDetail) {
            const total = detail?.metadata.properties.questions.length ? detail?.metadata.properties.questions.length : cacheDetail.properties.questions.length;
            percent = page === total ? 100 : (100/ total) * page;
            setPercent(percent);
        }
    },[page, detail, cacheDetail])

    const switchType = (question,i) => {
    // 2: 填空 0: 单选 1: 多选
        switch (question.type) {
            case 2:
                return <CustomInput plugins={plugins} key={i} label={question.title} value={changeAnswer} defaultValue={answers[i]} />
            case 1:
                return <CustomCheckbox plugins={plugins} key={i} label={question.title} options={question.options} value={changeAnswer} defaultValue={answers[i]} />
            case 0:
                return <CustomRadio plugins={plugins} key={i} label={question.title} options={question.options} value={changeAnswer} defaultValue={answers[i]} />
            default:
                break;
        }
        return
    }

    return (
        
        <div className="Challenge">
            <ModalConnect
                isModalOpen={signIn} 
                handleCancel={cancelModalConnect} 
            />
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
                            />
                            <div style={{display: "flex"}}>
                                <Link to={`/quests/${detail.tokenId}`} className="title">
                                    <div className="title">
                                        <ArrowLeftOutlined />
                                        <p>{detail?.title}</p>
                                    </div>
                                </Link>
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
                    <div className="content">
                        <h4>{t("challenge.title")} #{page}</h4>
                        {
                            // switchType(detail.metadata.properties.questions[index])
                            detail ? 
                            detail.metadata.properties.questions.map((e,i) => {
                                return i === index && switchType(e,i)
                            })
                            :
                            cacheDetail.properties.questions.map((e,i) => {
                                return i === index && switchType(e,i)
                            })
                        }
                    </div>
                    <div className="progress">
                        <Progress percent={percent} showInfo={false} />
                    </div>
                    <CustomPagination
                        type={detail ? "write" : "preview"}
                        page={page} 
                        total={
                            detail ?
                            detail.metadata.properties.questions.length
                            :
                            cacheDetail.properties.questions.length
                        } 
                        onChange={checkPage} 
                        submit={openAnswers}
                    />
                </>
            }
        </div>
    )
}