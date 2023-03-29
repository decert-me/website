import {
    ArrowLeftOutlined,
    ExportOutlined
} from '@ant-design/icons';
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { getQuests } from "../request/api/public";
import "@/assets/styles/view-style/challenge.scss"
import { Button, Progress } from 'antd';
import CustomPagination from '../components/CustomPagination';
import CustomInput from '../components/CustomChallenge/CustomInput';
import ModalAnswers from '../components/CustomModal/ModalAnswers';
import CustomCheckbox from '../components/CustomChallenge/CustomCheckbox';
import CustomRadio from '../components/CustomChallenge/CustomRadio';
import { useTranslation } from 'react-i18next';
import axios from "axios";
import { constans } from '@/utils/constans';

export default function Challenge(params) {

    const { t } = useTranslation(["explore"]);
    const { ipfsPath } = constans();
    const { questId } = useParams();
    const location = useLocation();
    const navigateTo = useNavigate();
    let [detail, setDetail] = useState();
    let [cacheDetail, setCacheDetail] = useState();
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
            answers = new Array(Number(detail.metadata.properties.questions.length))
            setAnswers([...answers])
        })
    }

    const changeAnswer = (e) => {
        answers[index] = e;
        setAnswers([...answers]);
        console.log('answers ===>',answers);
    }

    const sumbit = () => {
        // 本地 ==> 存储答案 ==> 跳转领取页
        let cache = localStorage.getItem("decert.cache") ? 
            JSON.parse(localStorage.getItem("decert.cache")) 
            : {};
        cache[detail.tokenId] = answers;
        localStorage.setItem("decert.cache", JSON.stringify(cache)); 
        navigateTo(`/claim/${detail.tokenId}`)
    }

    const cacheInit = async() => {
        const local = localStorage.getItem("decert.store");
        if (!local) {
            navigateTo("/explore");
            return
        }
        const cache = JSON.parse(local);
        const request = await axios.get(`${ipfsPath}/${cache.hash}`)
        cacheDetail = request.data;
        setCacheDetail({...cacheDetail});

        answers = new Array(Number(cache.questions.length))
        setAnswers([...answers])
        console.log(cacheDetail);
    }

    useEffect(() => {
        if (questId != 0) {
            getData(questId);
        }else{
            cacheInit();
        }
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
                (detail || cacheDetail) &&
                <>
                    {
                        detail ?
                        <>
                            <ModalAnswers
                                isModalOpen={isModalOpen}
                                handleCancel={handleCancel}
                                submit={sumbit}
                                answers={answers}
                                changePage={changePage}
                            />
                            <Link to={`/quests/${detail.tokenId}`}>
                                <div className="title">
                                    <ArrowLeftOutlined />
                                    <p>{detail?.title}</p>
                                </div>
                            </Link>
                        </>
                        :
                        <>
                        <div className="preview-head">
                            {t("mode-preview")}
                            <div className="btns">
                                {/* <Button>确认发布</Button> */}
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
                        sumbit={openAnswers}
                    />
                </>
            }
        </div>
    )
}