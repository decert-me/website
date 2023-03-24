import {
    ArrowLeftOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { getQuests } from "../request/api/public";
import "@/assets/styles/view-style/challenge.scss"
import { Progress } from 'antd';
import CustomPagination from '../components/CustomPagination';
import CustomInput from '../components/CustomChallenge/CustomInput';
import ModalAnswers from '../components/CustomModal/ModalAnswers';
import CustomCheckbox from '../components/CustomChallenge/CustomCheckbox';
import CustomRadio from '../components/CustomChallenge/CustomRadio';
import { useTranslation } from 'react-i18next';

export default function Challenge(params) {

    const { t } = useTranslation(["explore"]);
    const { questId } = useParams();
    const location = useLocation();
    const navigateTo = useNavigate();
    let [detail, setDetail] = useState();
    let [answers, setAnswers] = useState([]);
    let [percent, setPercent] = useState();
    
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
                        if (!e) {
                            page = i+2;
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

    const submit = () => {
        // 本地 ==> 存储答案 ==> 跳转领取页
        saveAnswer()
        navigateTo(`/claim/${detail.tokenId}`)
    }

    useEffect(() => {
        const id = questId;
        id && getData(id);
    }, []);

    useEffect(() => {
        // 修改进度条
        if (detail) {
            const total = detail?.metadata.properties.questions.length;
            percent = page === total ? 100 : (100/ total) * page;
            setPercent(percent);
        }
    },[page, detail])

    const switchType = (question,i) => {
    // 2: 填空 0: 单选 1: 多选
        switch (question.type) {
            case 2:
                return <CustomInput key={i} label={question.title} value={changeAnswer} defaultValue={answers[i]} />
            case 1:
                return <CustomCheckbox key={i} label={question.title} options={question.options} value={changeAnswer} defaultValue={answers[i]} />
            case 0:
                return <CustomRadio key={i} label={question.title} options={question.options} value={changeAnswer} defaultValue={answers[i]} />
            default:
                break;
        }
        return
    }

    return (
        
        <div className="Challenge">
            
            {
                detail &&
                <>
                    <ModalAnswers
                        isModalOpen={isModalOpen}
                        handleCancel={handleCancel}
                        submit={submit}
                        answers={answers}
                        changePage={changePage}
                    />
                    <Link to={`/quests/${detail.tokenId}`}>
                        <div className="title">
                            <ArrowLeftOutlined />
                            <p>{detail?.title}</p>
                        </div>
                    </Link>
                    <div className="content">
                        <h4>{t("challenge.title")} #{page}</h4>
                        {
                            // switchType(detail.metadata.properties.questions[index])
                            detail.metadata.properties.questions.map((e,i) => {
                                return i === index && switchType(e,i)
                            })
                        }
                    </div>
                    <div className="progress">
                        <Progress percent={percent} showInfo={false} />
                    </div>
                    <CustomPagination
                        page={page} 
                        total={detail.metadata.properties.questions.length} 
                        onChange={checkPage} 
                        submit={openAnswers}
                    />
                </>
            }
        </div>
    )
}