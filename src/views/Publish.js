import { message } from "antd";
import "@/assets/styles/view-style/publish.scss"
import "@/assets/styles/component-style";
import { useContext, useEffect, useState } from "react";
import ModalAddQuestion from "@/components/CustomModal/ModalAddQuestion";
import CustomForm from '@/components/Publish/CustomForm';

import { Encryption } from "@/utils/Encryption";
import { filterQuestions } from "@/utils/filter";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUpdateEffect } from "ahooks";
import { usePublish } from "@/hooks/usePublish";
import ModalEditQuestion from "@/components/CustomModal/ModalEditQuestion";
import MyContext from "@/provider/context";
import { getMetadata } from "@/utils/getMetadata";
import { useAccount } from "wagmi";
import ModalAddCodeQuestion from "@/components/CustomModal/ModalAddCodeQuestion";
import { changeConnect } from "@/utils/redux";
import { getQuests } from "@/request/api/public";
import store, { setChallenge } from "@/redux/store";

export default function Publish(params) {
    
    const navigateTo = useNavigate();
    const { t } = useTranslation(["publish", "translation"]);
    const { isMobile } = useContext(MyContext);
    const { address, isConnected } = useAccount();
    const location = useLocation();

    let [cache, setCache] = useState();   //  缓存
    let [changeId, setChangeId] = useState();   //  正在编辑的tokenId
    let [changeItem, setChangeItem] = useState();   //  正在编辑的挑战详情

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
    const [loading, setLoading] = useState(false);
    const { publish, isLoading, isOk, transactionLoading } = usePublish({
        jsonHash: publishObj?.jsonHash, 
        recommend: publishObj?.recommend,
        changeId: changeId
    });
    const { encode, decode } = Encryption();

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

    const getJson = async(values, preview) => {
        const { answers, questions: qs } = filterQuestions(questions);
        const image = values.fileList?.file?.response.data.hash
        const jsonHash = await getMetadata({
            values: values,
            address: address,
            questions: qs,
            answers: encode(process.env.REACT_APP_ANSWERS_KEY, JSON.stringify(answers)),
            image: changeId && !image ? changeItem.metadata.image : cache.hash.image !== "ipfs://undefined" ? cache.hash.image : "ipfs://"+image
        }, preview ? preview : null)
        return jsonHash
    }

    const saveCache = (questCache) => {
        localStorage.setItem("decert.store", JSON.stringify(questCache))
    }

    const changeQuestCache = () => {
        const cache = localStorage.getItem("decert.store");
        // TODO: 若是编辑模式，则缓存至全局，且在刷新时提示
        if (changeId) {
            return
        }
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
        const jsonHash = await getJson(values, "preview");
        let questCache = {
            hash: jsonHash,
            questions: questions,
            recommend: values.editor,
            isOver: isOver
        }
        
        // 修改挑战 or 发布挑战
        changeId ? 
        await store.dispatch(setChallenge(questCache))
        :
        localStorage.setItem("decert.store", JSON.stringify(questCache))

        goPreview();
    }

    const onFinish = async(values) => {
        if (!isConnected) {
            changeConnect()
            return
        }
        // 上传图片后删除: 若是`修改挑战`则跳过该判断
        if (!changeId && !Array.isArray(values.fileList) && values.fileList.file.status !== "done") {
            return
            
        }
        setLoading(true);
        const jsonHash = await getJson(values);
        publishObj = {
            jsonHash: jsonHash.hash,
            recommend: values.editor
        }
        setPublishObj({...publishObj});

        const cacheJSON = await getJson(values, "preview");
        let questCache = {
            hash: cacheJSON,
            questions: questions,
            recommend: values.editor
        }
        // 非`修改挑战`缓存
        !changeId && saveCache(questCache); 
        setLoading(false);
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

    function isSerializedString(str) {
        try {
          JSON.parse(str);
          return JSON.parse(str); // 字符串成功解析为对象，可以认为是序列化过的
        } catch (error) {
          return str; // 字符串无法解析为对象，不是序列化过的
        }
    }

    function getChallenge(tokenId) {
        // 获取对应challenge信息
        getQuests({id: tokenId})
        .then(res => {
            const data = res?.data
            recommend = isSerializedString(data.recommend);
            setRecommend(recommend);
            const answers = JSON.parse(decode(process.env.REACT_APP_ANSWERS_KEY, data.quest_data.answers))
            questions = data.quest_data.questions.map((e,i) => {
                return ({
                    ...e,
                    answers: answers[i]
                }) 
            });
            setQuestions([...questions]);
            changeItem = data;
            setChangeItem({...changeItem});
        })
    }

    const init = async() => {
        // 判断地址栏是否有传参
        const tokenId = location.search.replace("?","");
        if (tokenId) {
            // 获取tokenId对应challenge信息
            changeId = tokenId;
            setChangeId(changeId);
            getChallenge(tokenId);
            return
        }

        let local = localStorage.getItem("decert.store");
        if (!local) {
            return
        }
        cache = JSON.parse(local);
        setCache(cache);
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
            <h3>{changeId ? "修改挑战" : t("title")}</h3>
            <CustomForm 
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                deleteQuestion={deleteQuestion}
                writeLoading={isLoading || loading}
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
                changeConnect={changeConnect}
                changeItem={changeItem}
            />

        </div>
    )
}