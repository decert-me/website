import { Button, Divider, Form, Input, InputNumber, message, Select, Upload } from "antd";
import { InboxOutlined } from '@ant-design/icons';
import "@/assets/styles/view-style/publish.scss"
import "@/assets/styles/component-style";
import { useEffect, useState } from "react";
import ModalAddQuestion from "@/components/CustomModal/ModalAddQuestion";
import CustomQuestion from "@/components/CustomItem/CustomQuestion";
import ModalConnect from '@/components/CustomModal/ModalConnect';

import { UploadProps } from "@/utils/UploadProps";
import { Encryption } from "@/utils/Encryption";
import { filterQuestions } from "@/utils/filter";
import { useAccount, useNetwork, useSigner, useSwitchNetwork, useWaitForTransaction } from "wagmi";
import { addQuests, ipfsJson, submitHash } from "../request/api/public";
import { createQuest } from "../controller";
import { useNavigate } from "react-router-dom";
import { constans } from "@/utils/constans";
import { useTranslation } from "react-i18next";
import axios from "axios";
const { Dragger } = Upload;
const { TextArea } = Input;

export default function Publish(params) {
    
    const navigateTo = useNavigate();
    const { address, isConnected } = useAccount();
    const { data: signer } = useSigner();
    const { ipfsPath, maxUint32, maxUint192 } = constans();
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
    const [form] = Form.useForm();
    let [fields, setFields] = useState([]);
    
    let [isSwitch, setIsSwitch] = useState(false);
    let [showAddQs, setShowAddQs] = useState(false);
    let [questions, setQuestions] = useState([]);
    let [sumScore, setSumScore] = useState(0);
    let [connectModal, setConnectModal] = useState();
    let [isClick, setIsClick] = useState();
    
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

    const cancelModalConnect = () => {
        setConnectModal(false);
    }

    const write = (sign, obj) => {
        createQuest(obj, sign, signer)
        .then(res => {
            setWriteLoading(false);
            if (res) {
                submitHash({hash: res})
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
        // 已登录 未签名
        // if (isConnected && (!token || !convertToken(token))) {
        //     GetSign({address: address, signer: signer})
        //     return
        // }
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
                difficulty: values.difficulty ? values.difficulty : null,
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
            questions: questions
        }
        localStorage.setItem("decert.store", JSON.stringify(questCache))
        signature && write(signature.data, questData)
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
        fields = [
            {
                name: [
                    "title"
                ],
                value: questCache.data.title
            },
            {
                name: [
                    "desc"
                ],
                value: questCache.data.description
            },
            {
                name: [
                    "score"
                ],
                value: questCache.data.properties.passingScore
            },
            {
                name: [
                    "difficulty"
                ],
                value: questCache.data.properties.difficulty
            },
            {
                name: [
                    "time"
                ],
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
            <Form
                className="inner"
                name="challenge"
                layout="vertical"
                form={form}
                labelCol={{
                    span: 5,
                }}
                initialValues={{
                    remember: true,
                }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
                fields={fields}
            >
                <Form.Item
                    label={t("inner.title")}
                    name="title"
                    rules={[{
                        required: true,
                        message: t("inner.rule.title"),
                    }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item 
                    label={t("inner.desc")}
                    name="desc"
                >
                    <TextArea 
                        maxLength={300} 
                        showCount
                        autoSize={{
                            minRows: 3,
                            maxRows: 5,
                        }}
                      />
                </Form.Item>

                <Form.Item 
                    label={t("inner.img")}
                    name="fileList"
                    valuePropName="img"
                    rules={[{
                        required: true,
                        message: t("inner.rule.img"),
                    }]}
                    wrapperCol={{
                        offset: 1,
                    }}
                    style={{
                        maxWidth: 380,
                    }}
                >
                    <Dragger 
                        {...UploadProps} 
                        listType="picture-card"
                    >
                        <p className="ant-upload-drag-icon" style={{ color: "#a0aec0" }}>
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text " style={{ color: "#a0aec0" }}>
                            {t("inner.content.img.p1")}
                        </p>
                        <p className="ant-upload-hint " style={{ color: "#a0aec0" }}>
                            {t("inner.content.img.p2")}
                            <span style={{ color: "#f14e4e", fontSize: "20px" }}>*</span>
                        </p>
                    </Dragger>
                </Form.Item>

                <Divider />
                
                {/* question list */}
                <div className="questions">
                    {
                        questions.map((e,i) => 
                            <CustomQuestion 
                                key={i} 
                                item={e} 
                                index={i+1} 
                                deleteQuestion={deleteQuestion} 
                            />
                        )
                    }
                </div>

                {/* add multiple */}
                <div className="btns">
                    <Button 
                        type="link" 
                        onClick={() => showAddModal()}
                        danger={questions.length === 0 && isClick}
                    >
                        {t("inner.add")}
                    </Button>
                    {/* <Button type="link">
                        Add code question
                    </Button> */}
                </div>

                <div className="challenge-info">
                    <Form.Item 
                        label={t("inner.score")}
                        name="score"
                        rules={[{
                            required: true,
                            message: t("inner.rule.score"),
                        }]}
                    >
                        <InputNumber
                            min={1} 
                            max={sumScore === 0 ? 1 : sumScore}
                            controls={false}
                            precision={0}
                            style={{
                                width: "150px"
                            }}
                        />
                    </Form.Item>

                    <div className="form-item">
                        <p className="title">{t("inner.total")}</p>
                        <InputNumber 
                            value={sumScore} 
                            disabled
                            style={{
                                width: "150px"
                            }}
                        />
                    </div>

                    <Form.Item 
                        label={t("translation:diff")}
                        name="difficulty"
                    >
                        <Select
                            options={[
                                {value:0,label: t("translation:diff-info.easy")},
                                {value:1,label: t("translation:diff-info.normal")},
                                {value:2,label: t("translation:diff-info.diff")}
                            ]}
                        />
                    </Form.Item>

                    <Form.Item 
                        label={t("translation:time")}
                        name="time"
                    >
                        <Select 
                            options={[
                                {value: 600,label: t("translation:time-info.m", {time: "10"})},
                                {value: 1800,label: t("translation:time-info.m", {time: "30"})},
                                {value: 3600,label: t("translation:time-info.h", {time: "1"})},
                                {value: 7200,label: t("translation:time-info.h", {time: "2"})},
                                {value: 14400,label: t("translation:time-info.h", {time: "4"})},
                                {value: 86400,label: t("translation:time-info.d", {time: "1"})},
                                {value: 259200,label: t("translation:time-info.d", {time: "3"})},
                                {value: 604800,label: t("translation:time-info.w", {time: "1"})}
                            ]}
                        />
                    </Form.Item>
                </div>

                <Form.Item 
                    style={{
                        display: "flex",
                        justifyContent: "center"
                    }}
                >
                    <Button 
                        className="submit"
                        type="primary" 
                        htmlType="submit" 
                        loading={ writeLoading || waitLoading }
                    >
                        {t("translation:btn-submit")}
                    </Button>
                </Form.Item>
            </Form>

        </div>
    )
}