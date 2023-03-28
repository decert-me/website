import { message } from "antd";
import "@/assets/styles/view-style/publish.scss"
import "@/assets/styles/component-style";
import { useEffect, useState } from "react";
import ModalAddQuestion from "@/components/CustomModal/ModalAddQuestion";
import ModalConnect from '@/components/CustomModal/ModalConnect';
import CustomForm from '@/components/Publish/CustomForm';

import { Encryption } from "@/utils/Encryption";
import { filterQuestions } from "@/utils/filter";
import { useAccount, useNetwork, useSigner, useSwitchNetwork, useWaitForTransaction } from "wagmi";
import { addQuests, ipfsJson, submitHash } from "../request/api/public";
import { createQuest } from "../controller";
import { useNavigate } from "react-router-dom";
import { constans } from "@/utils/constans";
import { useTranslation } from "react-i18next";

import axios from "axios";
import { useVerifyToken } from "@/hooks/useVerifyToken";

export default function Publish(params) {
    
    const navigateTo = useNavigate();
    const { isConnected } = useAccount();
    const { data: signer } = useSigner();

    const { ipfsPath, maxUint32, maxUint192 } = constans();
    const { verify } = useVerifyToken();

    const { t } = useTranslation(["publish", "translation"]);
    const { switchNetwork } = useSwitchNetwork({
        chainId: Number(process.env.REACT_APP_CHAIN_ID),
        onError(error) {
            setIsSwitch(false);
        },
        onSuccess() {
            setIsSwitch(false);
        }
    })
    const { chain } = useNetwork();
    let [fields, setFields] = useState([]);
    
    let [isSwitch, setIsSwitch] = useState(false);
    let [showAddQs, setShowAddQs] = useState(false);
    let [questions, setQuestions] = useState([]);
    let [sumScore, setSumScore] = useState(0);
    let [connectModal, setConnectModal] = useState();
    let [isClick, setIsClick] = useState();
    let [recommend, setRecommend] = useState();
    
    const { encode } = Encryption();

    // 创建challenge
    let [createQuestHash, setCreateQuestHash] = useState();
    let [writeLoading, setWriteLoading] = useState();
    const { isLoading: waitLoading } = useWaitForTransaction({
        hash: createQuestHash,
        onSuccess() {
            setTimeout(() => {
                message.success(t("message.success.create"));
                localStorage.removeItem("decert.store");
                navigateTo("/explore")
            }, 1000);
        }
    })

    const clearLocal = () => {
        localStorage.removeItem("decert.store");
        setTimeout(() => {
            navigateTo(0);
        }, 500);
    }

    const showAddModal = () => {
        setShowAddQs(true);
    }

    const hideAddModal = () => {
        setShowAddQs(false);
    }

    const questionChange = ( val => {
        questions.push(val)
        setQuestions([...questions])
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

    const changeRecommend = (e) => {
        recommend = e;
        setRecommend(recommend);
    }

    const cancelModalConnect = () => {
        setConnectModal(false);
    }

    const write = (sign, obj, params) => {
        createQuest(obj, sign, signer)
        .then(res => {
            setWriteLoading(false);
            if (res) {
                submitHash({
                    hash: res, 
                    params: params
                })
                setCreateQuestHash(res)
            }
        })
    }

    const onFinish = async(values) => {
        if (questions.length === 0) {
            setIsClick(true);
            return
        }
        // 未登录
        if (!isConnected) {
            setConnectModal(true)
            return
        }
        // 已登录 未签名 || 签名过期
        let hasHash = true;
        await verify()
        .catch(() => {
            hasHash = false;
        })
        if (!hasHash) {
            return
        }
        // 链不同
        if (chain.id != process.env.REACT_APP_CHAIN_ID) {
            setIsSwitch(true);
            return
        }
        if (!values.fileList.file.response.hash) {
            return
        }
        setWriteLoading(true);
        // 1. 处理 答案、问题
        const { answers, questions: qs } = filterQuestions(questions);
        let obj = {
            title: values.title,
            description: values.desc,
            image: "ipfs://"+values.fileList.file.response.hash,
            properties: {
                questions: qs,
                answers: encode(process.env.REACT_APP_ANSWERS_KEY, JSON.stringify(answers)),
                passingScore: values.score,
                startTime: new Date().toISOString(),
                endTIme: null,
                url: "",
                requires: [],
                difficulty: values.difficulty !== undefined ? values.difficulty : null,
                estimateTime: values.time ? values.time : null
            },
            version: 1
        }
        const jsonHash = await ipfsJson({body: obj});
        const signature = jsonHash && await addQuests({
            uri: "ipfs://"+jsonHash.hash,
            title: values.title,
            description: values.desc,
            'start_ts': '0', 
            'end_ts': maxUint32.toString(), 
            'supply': maxUint192.toString(),       
        })
        const questData = {
            'startTs': 0, 
            'endTs': 0, 
            'supply': 0, 
            'title': values.title,
            'uri': "ipfs://"+jsonHash.hash, 
        }
        let questCache = {
            hash: jsonHash.hash,
            questions: questions,
            recommend: recommend
        }
        let params = {
            recommend: recommend
        }
        localStorage.setItem("decert.store", JSON.stringify(questCache))
        signature && write(signature.data, questData, JSON.stringify(params))
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
        if (questions.length === 0) {
            setIsClick(true);
        }
    };

    const init = async() => {
        // 1、local
        let local = localStorage.getItem("decert.store");
        if (!local) {
            return
        }
        const cache = JSON.parse(local);
        const questCache = await axios.get(`${ipfsPath}/${cache.hash}`)
        questions = cache.questions;
        setQuestions([...questions]);
        recommend = cache.recommend;
        setRecommend(recommend);
        fields = [
            {
                name: ["title"],
                value: questCache.data.title
            },
            {
                name: ["desc"],
                value: questCache.data.description
            },
            {
                name: ["score"],
                value: questCache.data.properties.passingScore
            },
            {
                name: ["difficulty"],
                value: questCache.data.properties.difficulty
            },
            {
                name: ["time"],
                value: questCache.data.properties.estimateTime
            }
        ]
        setFields([...fields])
    }

    useEffect(() => {
        changeSumScore()
    },[questions])

    useEffect(() => {
        if (isSwitch && switchNetwork) {
            switchNetwork()
        }
    },[switchNetwork, isSwitch])

    useEffect(() => {
        init();
    },[])

    return (
        <div className="Publish">
            <ModalConnect
                isModalOpen={connectModal} 
                handleCancel={cancelModalConnect} 
            />
            <ModalAddQuestion 
                isModalOpen={showAddQs} 
                handleCancel={hideAddModal}
                questionChange={questionChange}
              />
            <h3>{t("title")}</h3>
            <CustomForm 
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                deleteQuestion={deleteQuestion}
                writeLoading={writeLoading}
                clearLocal={clearLocal}
                showAddModal={showAddModal}
                fields={fields}
                questions={questions}
                isClick={isClick}
                sumScore={sumScore}
                waitLoading={waitLoading}
                changeRecommend={changeRecommend}
                recommend={recommend}
            />

        </div>
    )
}