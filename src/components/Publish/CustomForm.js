import { Button, Divider, Empty, Form, Input, InputNumber, Select, Upload } from "antd";
import { useTranslation } from "react-i18next";
import { ConfirmClearQuest } from "../CustomConfirm/ConfirmClearQuest";
import { CustomQuestion, CustomEditor } from "@/components/CustomItem";
import { useEffect, useState } from "react";
import { UploadProps } from "@/utils/UploadProps";
import { UploadOutlined } from '@ant-design/icons';
import { useUpdateEffect } from "ahooks";
import { constans } from "@/utils/constans";
import { useLocation } from "react-router-dom";
import { useAddress } from "@/hooks/useAddress";

const { TextArea } = Input;
const { Dragger } = Upload;


export default function CustomForm(props) {

    const { 
        onFinish, 
        onFinishFailed, 
        deleteQuestion, 
        writeLoading, 
        showAddModal,
        showAddCodeModal,
        questions,
        isClick,
        sumScore,
        waitLoading,
        recommend,
        preview,
        clearQuest,
        showEditModal,
        changeConnect,
        changeItem,
        changeId,
        challenge,
        setQuestion
    } = props;
    const { ipfsPath } = constans();
    const { t } = useTranslation(["publish", "translation"]);
    const [form] = Form.useForm();
    const { isConnected } = useAddress();
    const location = useLocation();
    let [fields, setFields] = useState([]);
    let [fileList, setFileList] = useState([]);

    function importFile(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const titleReg = /(?<=\d\.\s)(.*?)(?=（\d+）)/g;
            const titles = content.match(titleReg);

            const questions = content.trim().split(/\n\s*\n/);
            const result = questions.map((question, index) => {
                const lines = question.split('\n');
                const score = Number(lines[0].match(/（(\d+)）/)[1]);
                // const options = [];
                // const answers = [];
                const title = titles[index];
                let options = [];
                let answers = [];
                let type;
                lines.slice(1).forEach((line, index) => {
                    // const option = line.match(/- \**(.+)\**/)[1].replace(/\*/g, '');;
                    // options.push(eval(option));
                    // if (line.includes('**')) {
                    //     answers.push(index);
                    // }
                    if (line.startsWith('    - ')) {
                        // const option = line.match(/- \**(.+)\**/)[1].replace(/\*/g, '');;
                        // options.push(eval(option));
                        
                        options = lines.slice(1).map(line => {
                            let match = line.match(/- \[(.)\] (.*)/);
                            return match ? match[2] : null;
                        }).filter(Boolean);
                        // options.push(eval(option));
                        // answers = lines.slice(1).map((line, index) => {
                        //     return line.includes('[x]') ? index : null;
                        // }).filter(index => index !== null);
                        if (line.includes('[x]')) {
                            answers.push(index);
                        }
                    } else {
                        // Handle the new question format
                        options.push(eval(line));
                        answers.push(eval(line));
                    }
                });
                type = options.length === 1 ? "fill_blank" : answers.length === 1 ? "multiple_choice" : "multiple_response"
                if (type === "multiple_choice") {
                    answers = answers[0]
                }
                return { options, answers, score, title, type };
            });
            setQuestion(result);
        };
        reader.readAsText(file);
    }
    
    const checkPreview = async() => {
        let flag;
        await form.validateFields()
        .then(() => {
            flag = true;
        })
        .catch(() => {
            flag = false;
        })
        preview(form.getFieldsValue(), flag)
    }

    const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);

    function challengeInit(challenge) {
        const chanllengeInfo = challenge?.attributes?.challenge_ipfs_url;
        const img = challenge ? challenge.image : changeItem?.metadata.image;
        if (img && img.indexOf("undefined") === -1) {
            initImage(img.replace("ipfs://", ipfsPath+"/"));
        }
        fields = [
            {
                name: ["title"],
                value: challenge ? challenge?.name : changeItem?.title
            },
            {
                name: ["desc"],
                value: challenge ? challenge?.description : changeItem?.metadata.description
            },
            {
                name: ["score"],
                value: challenge ? chanllengeInfo?.passingScore : changeItem?.quest_data.passingScore
            },
            {
                name: ["difficulty"],
                value: challenge ? challenge?.attributes?.difficulty : changeItem?.metadata?.attributes?.difficulty
            },
            {
                name: ["time"],
                value: challenge ? chanllengeInfo?.estimateTime : changeItem?.quest_data?.estimateTime
            },
            {
                name: ["fileList"],
                value: fileList
            }
        ]
        setFields([...fields])
    }

    function initImage(img) {
        fileList = [{
            uid: '-1',
            name: 'image.png',
            status: 'done',
            url: img 
        }]
        setFileList([...fileList])
    }

    async function previewInit(params) {
        changeItem ? challengeInit() : challengeInit(challenge.hash);
    }

    const init = async() => {
        const local = localStorage.getItem("decert.store");
        if (!local) {
            return
        }
        const cache = JSON.parse(local);
        if (cache.hash.image?.indexOf("undefined") === -1) {
            initImage(cache.hash.image.replace("ipfs://", ipfsPath+"/"));
        }
        if (cache?.hash) {
            const nftCache = cache.hash
            const questCache = nftCache.attributes.challenge_ipfs_url
            fields = [
                {
                    name: ["title"],
                    value: questCache.title
                },
                {
                    name: ["desc"],
                    value: questCache.description
                },
                {
                    name: ["score"],
                    value: questCache?.passingScore
                },
                {
                    name: ["difficulty"],
                    value: nftCache.attributes?.difficulty
                },
                {
                    name: ["time"],
                    value: questCache?.estimateTime
                },
                {
                    name: ["fileList"],
                    value: fileList
                }
            ]
            setFields([...fields])
        }
    }

    useEffect(() => {
        init();
    },[location])

    useUpdateEffect(() => {
        // 修改挑战数据初始化
        changeId && previewInit();
    },[changeItem])

    useUpdateEffect(() => {
        challenge && previewInit();
    },[challenge])

    return (
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
                label={
                    <>
                        {t("inner.recommend")}
                        <span className="tip">*{t("inner.rule.recommend")}</span>
                    </>
                }
                name="editor"
                className="Editor-hide"
            >
                <CustomEditor initialValues={recommend} />
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
                <Upload
                    {...UploadProps} 
                    beforeUpload={(file) => {
                        if (!isConnected) {
                            changeConnect()
                            return false || Upload.LIST_IGNORE
                        }
                        UploadProps.beforeUpload(file)
                    }}
                    listType="picture-card"
                    className="custom-upload"
                    fileList={fileList}
                    onChange={handleChange}
                >
                    <p className="upload-icon">
                        <UploadOutlined />
                    </p>
                    <p className="text-title">
                        {t("inner.content.img.p1")}
                    </p>
                    <p className="text-normal">
                        {t("inner.content.img.p2")}
                    </p>
                    <p className="text-normal">{t("inner.content.img.p3")}</p>
                </Upload>
            </Form.Item>

            <Divider />
            
            {/* question list */}
            <div className="questions">
                <div className="quest-head">
                    <div className="left">
                        <span>*</span> {t("inner.test")} 
                    </div>
                    {
                        questions.length !== 0 &&
                        <Button 
                            type="link" 
                            onClick={() => ConfirmClearQuest(clearQuest)}
                        >
                            {t("inner.clear")} 
                        </Button>
                    }
                </div>
                {
                    questions.length !== 0 ?
                    <Divider />
                    :
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("inner.nodata")} />
                }
                {
                    questions.map((e,i) => 
                        <CustomQuestion
                            key={i} 
                            item={e} 
                            index={i+1} 
                            deleteQuestion={deleteQuestion}
                            showEditModal={showEditModal} 
                        />
                    )
                }
            </div>

            {/* add multiple */}
            <div className="add-btns">
                <Button
                    type="link" 
                    onClick={() => showAddModal()}
                    danger={questions.length === 0 && isClick}
                >
                    {t("inner.add")}
                </Button>

                <Button
                    type="link" 
                    onClick={() => showAddCodeModal()}
                    danger={questions.length === 0 && isClick}
                >
                    {t("inner.add-code")}
                </Button>
                <input type="file" accept=".md" onChange={importFile} />
            </div>
            <Divider />

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
                            // {value: 86400,label: t("translation:time-info.d", {time: "1"})},
                            // {value: 259200,label: t("translation:time-info.d", {time: "3"})},
                            // {value: 604800,label: t("translation:time-info.w", {time: "1"})}
                        ]}
                    />
                </Form.Item>
            </div>


            <div className="Publish-btns">
                <div className="btns">
                    <div className="left">
                    </div>
                    <div className="right">
                        <Button 
                            type="primary" 
                            ghost 
                            disabled={
                                questions.length === 0
                            }
                            onClick={() => checkPreview()}
                        >
                            {t("translation:btn-view")}
                        </Button>
                        <Form.Item
                            style={{
                                margin: 0
                            }}
                        >
                            <Button 
                                className="submit"
                                type="primary" 
                                htmlType="submit" 
                                loading={ writeLoading || waitLoading }
                            >
                                {
                                    changeItem ? 
                                    t("translation:btn-save"):
                                    t("translation:btn-publish")
                                }
                            </Button>
                        </Form.Item>
                    </div>
                </div>
            </div>
        </Form>
    )
}