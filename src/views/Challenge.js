import {
    ArrowLeftOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getQuests } from "../request/api/public";
import "@/assets/styles/view-style/challenge.scss"
import { Progress } from 'antd';
import CustomPagination from '../components/CustomPagination';
import CustomInput from '../components/CustomChallenge/CustomInput';
import ModalAnswers from '../components/CustomModal/ModalAnswers';
import CustomCheckbox from '../components/CustomChallenge/CustomCheckbox';
import CustomRadio from '../components/CustomChallenge/CustomRadio';

export default function Challenge(params) {

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
    }

    const sumbit = () => {
        // 本地 ==> 存储答案 ==> 跳转领取页
        let cache = localStorage.getItem("decert.cache") ? 
            JSON.parse(localStorage.getItem("decert.cache")) 
            : {};
        cache[detail.tokenId] = {
            answers: answers,
            detail: detail
        };
        localStorage.setItem("decert.cache", JSON.stringify(cache)); 
        navigateTo(`/claim/${detail.tokenId}`)
    }

    useEffect(() => {
        const id = location?.pathname?.split("/")[2];
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

    const switchType = (question) => {
    // 2: 填空 0: 单选 1: 多选
        switch (question.type) {
            case 2:
                return <CustomInput label={question.title} value={changeAnswer} defaultValue={answers[index]} />
            case 1:
                return <CustomCheckbox label={question.title} options={question.options} value={changeAnswer} defaultValue={answers[index]} />
            case 0:
                return <CustomRadio label={question.title} options={question.options} value={changeAnswer} defaultValue={answers[index]} />
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
                        submit={sumbit}
                        answers={answers}
                        changePage={changePage}
                    />
                    <Link to={`/question/${detail.tokenId}`}>
                        <div className="title">
                            <ArrowLeftOutlined />
                            <p>{detail?.title}</p>
                        </div>
                    </Link>
                    <div className="content">
                        <h4>QUIZ #{page}</h4>
                        {switchType(detail.metadata.properties.questions[index])}
                    </div>
                    <div className="progress">
                        <Progress percent={percent} showInfo={false} />
                    </div>
                    <CustomPagination
                        page={page} 
                        total={detail.metadata.properties.questions.length} 
                        onChange={checkPage} 
                        sumbit={openAnswers}
                    />
                </>
            }
        </div>
    )
}