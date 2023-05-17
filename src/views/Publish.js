import { message } from "antd";
import "@/assets/styles/view-style/publish.scss"
import "@/assets/styles/component-style";
import { useContext, useEffect, useState } from "react";
import ModalAddQuestion from "@/components/CustomModal/ModalAddQuestion";
import ModalConnect from '@/components/CustomModal/ModalConnect';
import CustomForm from '@/components/Publish/CustomForm';

import { Encryption } from "@/utils/Encryption";
import { filterQuestions } from "@/utils/filter";
import { ipfsJson } from "../request/api/public";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUpdateEffect } from "ahooks";
import { usePublish } from "@/hooks/usePublish";
import ModalEditQuestion from "@/components/CustomModal/ModalEditQuestion";
import MyContext from "@/provider/context";
import { getMetadata } from "@/utils/getMetadata";
import { useAccount } from "wagmi";
import ModalAddCodeQuestion from "@/components/CustomModal/ModalAddCodeQuestion";

export default function Publish(params) {
    
    const navigateTo = useNavigate();
    const { t } = useTranslation(["publish", "translation"]);
    const { isMobile } = useContext(MyContext);
    const { address } = useAccount();
    
    let [showAddQs, setShowAddQs] = useState(false);
    let [showAddCodeQs, setShowAddCodeQs] = useState(false);
    let [showEditQs, setShowEditQs] = useState(false);
    let [selectQs, setSelectQs] = useState();
    let [selectIndex, setSelectIndex] = useState();
    
    let [questions, setQuestions] = useState([]);
    let [sumScore, setSumScore] = useState(0);
    let [isClick, setIsClick] = useState();
    let [recommend, setRecommend] = useState();
    let [publishObj, setPublishObj] = useState({});
    let [isWrite, setIsWrite] = useState(false);
    const { publish, signIn, isLoading, isOk, transactionLoading, cancelModalConnect } = usePublish({
        jsonHash: publishObj?.jsonHash, 
        recommend: publishObj?.recommend
    });
    const { encode } = Encryption();

    function showAddModal(params) {
        setShowAddQs(true);
    }

    function showAddCodeModal(params) {
        setShowAddCodeQs(true);
    }
    
    const showEditModal = (index) => {
        const obj = questions[index];
        if (obj.type === "coding" || obj.type === "special_judge_coding") {
            // 编程题
            setShowAddCodeQs(true);
        }else{
            setShowEditQs(true);
        }
        selectQs = obj;
        setSelectQs({...selectQs});
        setSelectIndex(index);
    }

    const questionChange = ( val => {
        questions.push(val)
        setQuestions([...questions])
    })

    const questionEdit = ( (val) => {
        questions[selectIndex] = val;
        setQuestions([...questions]);
    })

    const deleteQuestion = (i) => {
        questions.splice(i,1);
        setQuestions([...questions]);
    }

    const changeSumScore = () => {
        let sum = 0;
        questions.map(e => {
            sum += Number(e.score);
        })
        sumScore = sum;
        setSumScore(sumScore);
    }

    const getJson = async(values) => {
        const { answers, questions: qs } = filterQuestions(questions);
        const jsonHash = await getMetadata({
            values: values,
            address: address,
            questions: qs,
            answers: encode(process.env.REACT_APP_ANSWERS_KEY, JSON.stringify(answers)),
            image: "ipfs://"+values.fileList?.file.response.hash
        })
        // let obj = {
        //     title: values.title,
        //     description: values.desc,
        //     image: "ipfs://"+values.fileList?.file.response.hash,
        //     properties: {
        //         questions: qs,
        //         answers: encode(process.env.REACT_APP_ANSWERS_KEY, JSON.stringify(answers)),
        //         passingScore: values.score,
        //         startTime: new Date().toISOString(),
        //         endTIme: null,
        //         url: "",
        //         requires: [],
        //         difficulty: values.difficulty !== undefined ? values.difficulty : null,
        //         estimateTime: values.time ? values.time : null
        //     },
        //     version: 1
        // }
        // const jsonHash = await ipfsJson({body: obj});
        return jsonHash
    }

    const saveCache = (questCache) => {
        localStorage.setItem("decert.store", JSON.stringify(questCache))
    }

    const changeQuestCache = () => {
        const cache = localStorage.getItem("decert.store");
        if (!cache) {
            let questCache = {
                hash: "",
                questions: questions,
                recommend: ""
            }
            localStorage.setItem("decert.store", JSON.stringify(questCache));
        }else{
            let store = JSON.parse(cache);
            store.questions = questions;
            localStorage.setItem("decert.store", JSON.stringify(store));
        }
    }

    const goPreview = () => {
        setTimeout(() => {
            navigateTo(`/preview`)
        }, 500);
    }

    const clearQuest = () => {
        questions = [];
        setQuestions([...questions]);
    }

    const preview = async(values, isOver) => {
        const jsonHash = await getJson(values);
        let questCache = {
            hash: jsonHash.hash,
            questions: questions,
            recommend: values.editor,
            isOver: isOver
        }
        localStorage.setItem("decert.store", JSON.stringify(questCache))
        goPreview();
    }

    const onFinish = async(values) => {
        // 上传图片后删除
        if (!values.fileList.file.response.hash) {
            return
        }
        const jsonHash = await getJson(values);
        publishObj = {
            jsonHash: jsonHash.hash,
            recommend: values.editor
        }
        setPublishObj({...publishObj});
        let questCache = {
            hash: jsonHash.hash,
            questions: questions,
            recommend: values.editor
        }
        saveCache(questCache);
        if (isWrite) {
            publish();
        }else{
            setIsWrite(true);
        }
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
        if (questions.length === 0) {
            setIsClick(true);
        }
    };

    function handleCancel(params) {
        setShowAddCodeQs(false)
        // 关闭弹窗并清空selectQs
        selectQs = null;
        setSelectQs(selectQs);
    }

    const init = async() => {
        let local = localStorage.getItem("decert.store");
        if (!local) {
            return
        }
        const cache = JSON.parse(local);
        questions = cache.questions;
        setQuestions([...questions]);
        recommend = cache.recommend;
        setRecommend(recommend);
    }

    useUpdateEffect(() => {
        changeQuestCache()
        changeSumScore()
    },[questions])

    useUpdateEffect(() => {
        if (isWrite, isOk) {
            publish();
        }
    },[isOk])

    useEffect(() => {
        init();
    },[])

    useEffect(() => {
        if (isMobile) {
            message.info(t("translation:message.info.mobile-publish"))
            navigateTo('/')
        }
    },[isMobile])

    return (
        <div className="Publish">
            <ModalConnect
                isModalOpen={signIn} 
                handleCancel={cancelModalConnect} 
            />
            <ModalAddQuestion 
                isModalOpen={showAddQs} 
                handleCancel={() => {setShowAddQs(false)}}
                questionChange={questionChange}
            />
            {
                showAddCodeQs &&
                <ModalAddCodeQuestion 
                    isModalOpen={showAddCodeQs} 
                    handleCancel={() => handleCancel()}
                    questionChange={questionChange}
                    // 编辑部分
                    selectQs={selectQs}
                    questionEdit={questionEdit}
                />
            }
            <ModalEditQuestion
                isModalOpen={showEditQs} 
                handleCancel={() => {setShowEditQs(false)}}
                questionChange={questionEdit}
                selectIndex={selectIndex}
                selectQs={selectQs}
            />
            <h3>{t("title")}</h3>
            <CustomForm 
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                deleteQuestion={deleteQuestion}
                writeLoading={isLoading}
                waitLoading={transactionLoading}
                showAddModal={showAddModal}
                showAddCodeModal={showAddCodeModal}
                showEditModal={showEditModal}
                questions={questions}
                isClick={isClick}
                sumScore={sumScore}
                recommend={recommend}
                preview={preview}
                clearQuest={clearQuest}
            />

        </div>
    )
}