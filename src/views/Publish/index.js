import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Form, Input, InputNumber, Select, Spin, Upload, message } from "antd";
import { UploadOutlined } from '@ant-design/icons';
import { useUpdateEffect } from "ahooks";
import { useSigner } from "wagmi";
import "@/assets/styles/view-style/publish.scss"
import "@/assets/styles/component-style";

import { CustomEditor } from "@/components/CustomItem";
import { UploadProps } from "@/utils/UploadProps";
import { useAddress } from "@/hooks/useAddress";
import { changeConnect } from "@/utils/redux";
import PublishQuestion from "./question";
import { filterQuestions } from "@/utils/filter";
import { getMetadata } from "@/utils/getMetadata";
import { Encryption } from "@/utils/Encryption";
import { useLocation, useNavigate } from "react-router-dom";
import { getQuests, modifyRecommend } from "@/request/api/public";
import { usePublish } from "@/hooks/usePublish";
import { clearDataBase, getDataBase, saveCache } from "@/utils/saveCache";
import store, { setChallenge } from "@/redux/store";
import { tokenSupply } from "@/controller";


const { TextArea } = Input;

export default function Publish(params) {
    
    const navigateTo = useNavigate();
    const location = useLocation();
    const dataBase = "publish";
    const [form] = Form.useForm();
    const isFirstRender = useRef(true);     //  是否是第一次渲染
    const questions = Form.useWatch("questions", form);     //  舰艇form表单内的questions

    const { data: signer } = useSigner();
    const { isConnected, walletType, address } = useAddress();
    const { t } = useTranslation(["publish", "translation"]);
    const { encode, decode } = Encryption();
    const [tradeLoading, setTradeLoading] = useState(false);    //  上链Loading
    const [loading, setLoading] = useState(false);      //  发布loading
    const [isEdit, setIsEdit] = useState();      //  是否是编辑模式
    
    let [cache, setCache] = useState();   //  缓存
    let [fields, setFields] = useState([]);     //  表单默认值
    let [fileList, setFileList] = useState([]);     //  图片回显
    let [sumScore, setSumScore] = useState();   //  总分

    let [publishObj, setPublishObj] = useState({});     //  交易所需变量
    let [isWrite, setIsWrite] = useState(false);        //  发起交易

    let [changeId, setChangeId] = useState();   //  正在编辑的tokenId
    let [changeItem, setChangeItem] = useState();   //  正在编辑的挑战详情

    const { publish, isLoading, isOk, transactionLoading } = usePublish({
        jsonHash: publishObj?.jsonHash, 
        recommend: publishObj?.recommend,
        changeId: isEdit
    });

    // json => ipfs
    const getJson = async(values, preview) => {
        const { answers, questions: qs } = filterQuestions(questions);
        const image = Array.isArray(values.fileList) ? values.fileList[0].response?.data.hash : values.fileList?.file?.response?.data.hash
        const jsonHash = await getMetadata({
            values: values,
            address: address,
            questions: qs,
            answers: encode(JSON.stringify(answers)),
            image: "ipfs://"+image,
            startTime: isEdit ? changeItem.startTime : null,
            olduuid: isEdit ? changeItem.uuid : null
        }, preview ? preview : null)
        return jsonHash
    }

    // 判断是否是修改挑战
    // 如果是修改挑战，则对比hash判断是否需要发起交易。  修改了: 发起交易   未修改: 终止
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
                    token_id: Number(isEdit),
                    recommend: publishObj.recommend
                }).then(res => {
                    res?.message && message.success(res?.message);
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

    // 修改Form内容
    function changeForm(key, value) {
        form.setFieldValue(key, value);
        if (key === "questions") {
            totalScore(value);
            saveCache(dataBase, form.getFieldsValue(), isEdit);
        }
    }

    // 提交表单 => 发布
    async function onFinish(values) {
        // 是否登陆 || 是否是evm钱包
        if (!isConnected || walletType !== "evm") {
            walletType !== "evm" && message.info(t("translation:message.info.solana-publish"));
            changeConnect()
            return
        }

        setLoading(true);
        // 交易上链 ===>
        const jsonHash = await getJson(values);
        // jsonHash不存在的话则抛出
        if (!jsonHash?.hash) {
            console.error("数据错误");
            return
        }
        publishObj = {
            jsonHash: jsonHash.hash,
            recommend: values.editor
        }
        setPublishObj({...publishObj});

        // 如果是修改挑战，则对比hash判断是否需要发起交易。  修改了: 发起交易   未修改: 终止
        if (!await isHashChange()) {
            return
        }
        
        setLoading(false);

        if (isWrite) {
            publish();
        }else{
            setIsWrite(true);
        }
    }

    // 提交表单 => 填写验证失败
    function onFinishFailed(values) {
        console.log(values);
        
    }

    // 上传图片格式检测
    function beforeUpload(file) {
        const formatArr = ["image/jpeg","image/png","image/svg+xml","image/gif"]
        let isImage = false
        formatArr.map((e)=>{
        if ( file.type === e ) {
            isImage = true
        }
        })
        if (!isConnected) {
            changeConnect()
            return Upload.LIST_IGNORE
        }
        if (!isImage) {
            message.error("You can only upload JPG/PNG file!");
            return Upload.LIST_IGNORE
        }
        const isLt100M = file.size / 1024 / 1024 < 20;
        if (!isLt100M) {
            message.error("Image must smaller than 20MB!");
            return Upload.LIST_IGNORE
        }
    }

    // 总分计数
    function totalScore(arr) {
        let sum = 0;
        arr && arr.map(e => {
            sum += e.score;
        })
        setSumScore(sum);
    }

    // 修改挑战情况下 => 判断该挑战是否有人铸造
    async function hasClaimed(tokenId) {
        const supply = await tokenSupply(tokenId, signer)
        // 已有人claim，终止
        if ( typeof supply === "number" && supply > 0) {
            message.warning(t("profile:edit.error"));
            setTimeout(() => {
                navigateTo(-1)
            }, 1000);
            return true
        }else{
            return false
        }
    }

    // 推荐教程反序列化
    function isSerializedString(str) {
        try {
          JSON.parse(str);
          return JSON.parse(str); // 字符串成功解析为对象，可以认为是序列化过的
        } catch (error) {
          return str; // 字符串无法解析为对象，不是序列化过的
        }
    }

    // 获取挑战详情
    async function getChallenge(tokenId) {
        const fetch = await getQuests({id: tokenId, original: true})
        const data = fetch?.data
        // 没有该挑战、该挑战不是你的
        if (!fetch || (address !== data.creator)) {
            navigateTo("/404")
            return
        }
        // 是否有人铸造
        const isClaim = await hasClaimed(tokenId);
        if (isClaim) {
            return
        }
        // 获取对应challenge信息
        const { title, description, recommend, metadata, quest_data, difficulty, uri, uuid } = data;
        const answers = JSON.parse(decode(data.quest_data.answers))
        const editor = isSerializedString(recommend);
        const questions = quest_data.questions.map((e,i) => {
            return ({
                ...e,
                answers: answers[i]
            }) 
        });
        changeItem = {
            tokenId,
            title,
            desc: description,
            editor,
            fileList: [{
                uid: '-1',
                name: 'image.png',
                status: 'done',
                response: {
                    data: {
                        hash: metadata.image.replace("ipfs://","")
                    }
                },
                thumbUrl: `https://ipfs.decert.me/${metadata.image.replace("ipfs://","")}`
            }],
            questions: questions,
            score: quest_data.passingScore,
            difficulty,
            time: quest_data.estimateTime,
            uri,
            startTime: quest_data.startTime,
            uuid,
        }
        setChangeItem({...changeItem});
        //  redux中是否已经有缓存
        const { challenge } = await store.getState();
        if (challenge) {
            cache = challenge;
            setCache({...cache});
            setTradeLoading(false);
            form.setFieldsValue(cache);
            fileList = Array.isArray(cache.fileList) ? cache.fileList : cache.fileList.fileList;
            setFileList([...fileList]);
            totalScore(cache.questions || []);
            return
        }
        form.setFieldsValue(changeItem);
        fileList = changeItem.fileList || [];
        setFileList([...fileList]);
        totalScore(changeItem.questions || []);
        setTradeLoading(false);
    }

    // 预览
    async function preview() {
        // 判断是否是修改挑战
        if (isEdit) {
            // {title, questions}
            const values = await form.getFieldsValue();
            // 存储至indexDB
            // saveCache("editChallenge", {
            //     token_id: isEdit,
            //     title,
            //     questions
            // })
            const obj = {
                ...values,
                token_id: isEdit,   
            }
            console.log(values);
            // 改为存储至redux，刷新丢失 ==>
            await store.dispatch(setChallenge(obj))
        }
        setTimeout(() => {
            navigateTo(`/preview${isEdit ? "?"+isEdit : ""}`)
        }, 500);
    }

    async function init() {
        const tokenId = location.search.replace("?","");
        const arr = await getDataBase(dataBase);
        // 是否是编辑模式 => 获取编辑挑战详情
        if (tokenId) {
            setIsEdit(tokenId);
            return
        }
        // 有本地缓存
        if (arr && arr.length !== 0) {
            // TODO: 判断缓存是否过期 => 1 * 60 * 60
            if (arr[0].update_time + (1 * 60 * 60) < Math.floor(Date.now() / 1000)) {
                clearDataBase(dataBase)
                return
            }
            
            cache = arr[0];
            fileList = cache.fileList || [];
            setFileList(fileList)

            setCache({...cache})
            form.setFieldsValue(cache);
            totalScore(cache.questions || []);
        }
    }

    useUpdateEffect(() => {
        saveCache(dataBase, form.getFieldsValue(), isEdit);
    },[questions])

    useUpdateEffect(() => {
        isWrite && isOk && publish();
    },[isOk])

    useEffect(() => {
        init();
    },[])

    useEffect(() => {
        const tokenId = location.search.replace("?","");
        tokenId && signer && address && getChallenge(tokenId);
    },[signer, address])

    return (
        <Spin spinning={tradeLoading}>
            <div className="Publish">
                
                {/* 标题 */}
                <h3>{isEdit ? t("title-modify") : t("title")}</h3>

                {/* Form表单 */}
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
                    onValuesChange={(value, values) => {
                        if (isFirstRender.current) {
                            isFirstRender.current = false; // 设置标志为false，表示已经不是第一次渲染了
                            return;
                        }
                        saveCache(dataBase, values, isEdit);
                    }}
                >
                    {/* 标题 */}
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

                    {/* 描述 */}
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

                    {/* 推荐教程 */}
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
                        <CustomEditor onChange={(value) => changeForm("editor", value)} initialValues={cache?.editor || changeItem?.editor} />
                    </Form.Item>

                    {/* 图片 */}
                    <Form.Item 
                        label={t("inner.img")}
                        name="fileList"
                        valuePropName="img"
                        rules={[{
                            required: true,
                            message: t("inner.rule.img"),
                        }]}
                        wrapperCol={{ offset: 1 }}
                        style={{ maxWidth: 380 }}
                    >
                        <Upload
                            {...UploadProps} 
                            beforeUpload={(file) => beforeUpload(file)}
                            listType="picture-card"
                            className="custom-upload"
                            fileList={fileList}
                            onChange={({fileList: newFileList}) => {
                                setFileList(newFileList)
                            }}
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

                    {/* 添加题目 */}
                    <Form.Item 
                        label={t("inner.test")}
                        className="questions"
                        name="questions"
                        style={{
                            paddingTop: "15px"
                        }}
                        rules={[{
                            required: true,
                            message: <div className="quest-message">{t("inner.rule.ques2")}</div>
                        }]}
                    >
                        <PublishQuestion
                            questions={questions || []}
                            clearQuest={() => {
                                changeForm("questions", null);
                            }}
                            deleteQuestion={(index) => {
                                const arr = JSON.parse(JSON.stringify(questions));
                                arr.splice(index, 1);
                                changeForm("questions", arr);
                            }}
                            questionChange={(quest) => {
                                const newArr = questions || [];
                                newArr.push(quest);
                                changeForm("questions", newArr);
                            }} 
                            questionEdit={(quest, index) => {
                                const newArr = questions;
                                newArr[index] = quest;
                                changeForm("questions", newArr);
                            }}
                            questionImport={(quests) => {
                                changeForm("questions", quests);
                            }}
                        />
                    </Form.Item>

                    <div className="challenge-info">
                        {/* 及格分 */}
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

                        {/* 总分 */}
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

                        {/* 难度 */}
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

                        {/* 预计时间 */}
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
                                ]}
                            />
                        </Form.Item>
                    </div>

                    {/* 提交按钮 */}
                    <div className="Publish-btns">
                        {/* 预览 */}
                        <Button
                            type="primary" 
                            ghost 
                            disabled={ !questions || questions.length === 0 }
                            onClick={() => preview()}
                        >{t("translation:btn-view")}</Button>

                        {/* 提交 */}
                        <Form.Item style={{margin: 0}}>
                            <Button 
                                className="submit"
                                type="primary" 
                                htmlType="submit" 
                                loading={ isLoading || loading || transactionLoading }
                            >
                                {
                                    isEdit ? 
                                    t("translation:btn-save"):
                                    t("translation:btn-publish")
                                }
                            </Button>
                        </Form.Item>
                    </div>
                </Form>
            </div>
        </Spin>
    )
}