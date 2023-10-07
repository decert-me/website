import { Spin, message } from "antd";
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
import { useSigner } from "wagmi";
import ModalAddCodeQuestion from "@/components/CustomModal/ModalAddCodeQuestion";
import { changeConnect } from "@/utils/redux";
import { getQuests, modifyRecommend } from "@/request/api/public";
import store, { setChallenge } from "@/redux/store";
import { tokenSupply } from "@/controller";
import { useAddress } from "@/hooks/useAddress";

export default function Publish(params) {
    
    const navigateTo = useNavigate();

    const { t } = useTranslation(["publish", "translation", "profile"]);
    const { isMobile } = useContext(MyContext);
    const { address, isConnected } = useAddress();
    const { data: signer } = useSigner();
    const location = useLocation();
    const [messageApi, contextHolder] = message.useMessage();

    let [cache, setCache] = useState();   //  缓存
    let [changeId, setChangeId] = useState();   //  正在编辑的tokenId
    let [changeItem, setChangeItem] = useState();   //  正在编辑的挑战详情
    let [tradeLoading, setTradeLoading] = useState(false);

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
        const image = values.fileList?.file?.response?.data.hash
        const jsonHash = await getMetadata({
            values: values,
            address: address,
            questions: qs,
            answers: encode(process.env.REACT_APP_ANSWERS_KEY, JSON.stringify(answers)),
            image: (changeId && cache && image) ? "ipfs://"+image : (changeId && cache) ? cache?.hash.image : (changeId && !image) ? changeItem.metadata.image : (cache && !image) ? cache?.hash.image : "ipfs://"+image,
            startTime: changeId && !cache ? changeItem.quest_data.startTime : changeId && cache ? cache.hash.attributes.challenge_ipfs_url.startTime : null,
            olduuid: changeId && !cache ? changeItem.uuid : changeId && cache ? cache.hash.attributes.challenge_url.split("/").reverse()[0] : null
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
        await store.dispatch(setChallenge({...questCache, changeId}))
        :
        localStorage.setItem("decert.store", JSON.stringify(questCache))

        goPreview();
    }

    async function isHashChange() {
        // 创建挑战直接返回
        if (!changeItem) {
            return true
        }
        // 判断是否修改了内容
        if (changeItem.uri.indexOf(publishObj.jsonHash) !== -1) {
            // 没修改内容

            // 判断是否修改了recommend
            if (JSON.stringify(publishObj.recommend) !== JSON.stringify(changeItem.recommend)) {
                // 修改了recommend ==> 发起修改recommend请求
                let result = await modifyRecommend({
                    token_id: Number(changeId),
                    recommend: publishObj.recommend
                }).then(res => {
                    res?.message && messageApi.open({
                        type: 'success',
                        content: res?.message,
                    });
                    !res && setLoading(false);
                    return res
                })
                result &&
                setTimeout(() => {
                    navigateTo(`/quests/${changeId}`)
                }, 1000);
            }else{
                navigateTo(`/quests/${changeId}`)
            }
            return false
        }else{
            return true
        }
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

        // 如果是修改挑战，则对比hash判断是否需要发起交易。  修改了: 发起交易   未修改: 终止
        if (!await isHashChange()) {
            return
        }

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

    async function getChallenge(tokenId) {
        const fetch = await getQuests({id: tokenId})
        const data = fetch?.data
        // 没有该挑战、该挑战不是你的
        if (!fetch || (address !== data.creator)) {
            navigateTo("/404")
            return
        }

        const supply = await tokenSupply(tokenId, signer)
            .then(res => {
                return res
            })
            .catch(err => {
                console.log(err);
            })
        // 已有人claim，终止
        if (supply > 0) {
            messageApi.open({
                type: 'warning',
                content: t("profile:edit.error"),
            });
            setTimeout(() => {
                navigateTo(-1)
            }, 1000);
            return
        }
        const { challenge } = await store.getState();
        if (challenge) {
            cache = challenge;
            setCache(cache);
            questions = cache.questions;
            setQuestions([...questions]);
            recommend = cache.recommend;
            setRecommend(recommend);
            setTradeLoading(false);
            return
        }
        // 获取对应challenge信息
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

        setTradeLoading(false);
    }

    const init = async() => {
        // 判断地址栏是否有传参
        const tokenId = location.search.replace("?","");
        if (tokenId) {
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
        if (isWrite && isOk) {
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

    useEffect(() => {
        const tokenId = location.search.replace("?","");
        if (tokenId && signer ) {            
            setTradeLoading(true);
            // 获取tokenId对应challenge信息
            changeId = tokenId;
            setChangeId(changeId);
            getChallenge(tokenId);
        }
    },[signer])

    useUpdateEffect(() => {
        // 修改挑战 to 创建挑战 刷新
        navigateTo(0)
    },[location])

    return (
        <Spin spinning={tradeLoading}>
        <div className="Publish">
            {contextHolder}
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
            <h3>{changeId ? t("title-modify") : t("title")}</h3>
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
                changeId={changeId}
                challenge={cache}
            />

        </div>
        </Spin>
    )
}