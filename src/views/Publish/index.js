import i18n from 'i18next';
import ImgCrop from 'antd-img-crop';
import { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Form, Input, InputNumber, Select, Spin, Upload, message } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import { useUpdateEffect } from "ahooks";
import { useAccount, useDisconnect, useNetwork, useSwitchNetwork } from "wagmi";
import "@/assets/styles/view-style/publish.scss"
import "@/assets/styles/component-style";

import { CustomEditor } from "@/components/CustomItem";
import { UploadProps } from "@/utils/UploadProps";
import { useAddress } from "@/hooks/useAddress";
import PublishQuestion from "./question";
import { filterQuestions } from "@/utils/filter";
import { getMetadata } from "@/utils/getMetadata";
import { Encryption } from "@/utils/Encryption";
import { useLocation, useNavigate } from "react-router-dom";
import { getQuests, getUser, modifyRecommend } from "@/request/api/public";
import { usePublish } from "@/hooks/usePublish";
import { clearDataBase, getDataBase, saveCache } from "@/utils/saveCache";
import store, { setChallenge } from "@/redux/store";
import MyContext from "@/provider/context";
import { CHAINS, CHAINS_TESTNET } from "@/config";
import UploadTmplModal from './uploadTmplModal';
import { useVerifyToken } from '@/hooks/useVerifyToken';
import { convertToken } from '@/utils/convert';
import { getLabelList } from '@/request/api/admin';


const { TextArea } = Input;

export default function Publish(params) {
    
    const chainList = process.env.REACT_APP_IS_DEV ? CHAINS_TESTNET : CHAINS;
    const navigateTo = useNavigate();
    const location = useLocation();
    const dataBase = "publish";
    const [form] = Form.useForm();
    const isFirstRender = useRef(true);     //  是否是第一次渲染
    const uploadRef = useRef();
    const questions = Form.useWatch("questions", form);     //  舰艇form表单内的questions

    const { connectWallet } = useContext(MyContext);
    const { verify } = useVerifyToken();
    const { chain } = useNetwork();
    const { disconnectAsync } = useDisconnect();
    const { switchNetworkAsync } = useSwitchNetwork()
    const { isConnected, walletType, address } = useAddress();
    const { t } = useTranslation(["publish", "translation"]);
    const { encode, decode } = Encryption();
    const [tradeLoading, setTradeLoading] = useState(false);    //  上链Loading
    const [loading, setLoading] = useState(false);      //  发布loading
    const [isEdit, setIsEdit] = useState();      //  是否是编辑模式
    const [tmplModal, setTmplModal] = useState(false);       //  图片模板弹窗
    
    const [category, setCategory] = useState([]);
    const [tagsOption, setTagsOption] = useState([]);
    let [cache, setCache] = useState();   //  缓存
    let [fields, setFields] = useState([]);     //  表单默认值
    let [fileList, setFileList] = useState([]);     //  图片回显
    let [sumScore, setSumScore] = useState();   //  总分

    let [publishObj, setPublishObj] = useState({});     //  交易所需变量
    let [isWrite, setIsWrite] = useState(false);        //  发起交易

    let [changeItem, setChangeItem] = useState();   //  正在编辑的挑战详情

    const { publish, isLoading, isOk, transactionLoading } = usePublish({
        jsonHash: publishObj?.jsonHash, 
        recommend: publishObj?.recommend,
        category: publishObj?.category,
        changeId: isEdit,
        clear: () => {
            setPublishObj(null);
            isWrite = false;
            setIsWrite(isWrite);
        }
    });

    // json => ipfs
    const getJson = async(values, preview) => {
        try {            
            const { answers, questions: qs } = filterQuestions(questions);
            const media = Array.isArray(values.fileList) ? values.fileList[0].response?.data.hash : values.fileList?.file?.response?.data.hash
            let base64 = fileList[0].thumbUrl;
            if (base64.indexOf("https://ipfs.decert.me/") !== -1) {
                base64 = fileList[0].path
            }
            const jsonHash = await getMetadata({
                values: values,
                address: address,
                questions: qs,
                answers: encode(JSON.stringify(answers)),
                image: "ipfs://"+media,
                // media: "ipfs://"+media,
                startTime: isEdit ? changeItem.startTime : null,
                olduuid: isEdit ? changeItem.uuid : null
            }, preview ? preview : null)
            return jsonHash
        } catch (error) {
            console.log(error);
        }
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

            // 判断是否修改了分类
            // 判断是否修改了recommend
            if (JSON.stringify(publishObj.recommend) !== JSON.stringify(changeItem.recommend) || JSON.stringify(publishObj.category) !== JSON.stringify(changeItem.category)) {
                // 修改了recommend ==> 发起修改recommend请求
                let result = await modifyRecommend({
                    token_id: isEdit,
                    recommend: publishObj.recommend,
                    category: publishObj.category
                }).then(res => {
                    res?.message && message.success(res?.message);
                    !res && setLoading(false);
                    return res
                })
                result &&
                setTimeout(() => {
                    navigateTo(`/quests/${isEdit}`)
                }, 1000);
            }else{
                navigateTo(`/quests/${isEdit}`)
            }
            return false
        }else{
            return true
        }
    }

    function changeTags(value) {
        if (value.length > 5) {
            return
        }
        setCategory([...value]);
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
            connectWallet()
            return
        }
        if (values.fileList[0].status === "error") {
            return
        }
        // 是否是正确的链
        if (
            (values?.chain && chain.id !== values.chain) ||
            (changeItem?.chain_id && chain.id !== changeItem.chain_id)
        ) {
            try {
                await switchNetworkAsync(values.chain || changeItem.chain_id);
            } catch (error) {
                console.log("switchChain Error: ", error);
            }
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
            recommend: values.editor,
            category: category
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
    async function beforeUpload(file) {
        const formatArr = ["image/jpeg","image/png","image/svg+xml","image/gif","image/webp"]
        let isImage = false
        formatArr.map((e)=>{
        if ( file.type === e ) {
            isImage = true
        }
        })
        const token = localStorage.getItem('decert.token');
        const isToken = convertToken(token);

        if (isConnected && (!token || !isToken)) {
            await store.dispatch(showCustomSigner());
            return Upload.LIST_IGNORE
        }
        if (!isConnected) {
            connectWallet()
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
        // TODO: 改为后端查
        // const supply = await tokenSupply(tokenId, signer)
        const supply = 0
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
        // const isClaim = await hasClaimed(tokenId);
        // if (isClaim) {
        //     return
        // }
        // console.log(data);
        // 获取对应challenge信息
        const { title, description, recommend, metadata, quest_data, uri, uuid, chain_id, category } = data;
        const answers = JSON.parse(decode(data.quest_data.answers))
        const editor = isSerializedString(recommend);
        setCategory(category);
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
            difficulty: metadata.attributes.difficulty,
            time: quest_data.estimateTime,
            uri,
            startTime: quest_data.startTime,
            uuid,
            chain_id
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
            // 改为存储至redux，刷新丢失 ==>
            await store.dispatch(setChallenge(obj))
        }
        setTimeout(() => {
            navigateTo(`/preview/quests${isEdit ? "?"+isEdit : ""}`)
        }, 500);
    }

    async function processAccount(address) {
        // 校验账号是否有权限发布挑战
        if (!address) {
            navigateTo("/");
        }else{
            const user = await getUser({address})
            if (!user.data.is_admin) {
                navigateTo("/")
            }
        }
    }

    async function init() {
        await getLabelList({type: "category"})
        .then(res => {
            if (res.status === 0) {
                const list = res.data || [];
                list.map(e => {
                    // e.key = e.ID;
                    e.value = e.ID;
                    e.label = i18n.language === "zh-CN" ? e.Chinese : e.English;
                })
                setTagsOption([...list]);
            }
        })
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
        processAccount(address);        
    },[address])

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
        tokenId && address && getChallenge(tokenId);
    },[address])

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
                    labelCol={{span: 5}}
                    initialValues={{remember: true}}
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

                    {/* 图片 */}
                    <UploadTmplModal 
                        isModalOpen={tmplModal} 
                        handleCancel={() => setTmplModal(false)} 
                        showUploadModal={() => {
                            const dom = document.querySelector(".ant-upload input");
                            dom.click();
                        }} 
                        selectTmplImg={(newFileList) => {
                            setFileList(newFileList);
                            form.setFieldValue("fileList", newFileList);
                            const values = form.getFieldsValue();
                            saveCache(dataBase, values, isEdit);
                        }}
                    />
                    <Form.Item 
                        label={t("inner.img")}
                        name="fileList"
                        valuePropName="img"
                        rules={[{
                            required: true,
                            message: t("inner.rule.img"),
                        }]}
                        wrapperCol={{ offset: 1 }}
                    >
                        <ImgCrop 
                            modalTitle={t("inner.content.img.cut")}
                            modalOk={t("translation:btn-save")}
                            modalCancel={t("translation:btn-cancel")}
                        >
                        <Upload
                            {...UploadProps} 
                            beforeUpload={(file) => beforeUpload(file)}
                            listType="picture-card"
                            className="custom-upload"
                            fileList={fileList}
                            openFileDialogOnClick={false}
                            onChange={({fileList: newFileList}) => {
                                if (newFileList[0] && newFileList[0].error) {
                                    let file = JSON.parse(JSON.stringify(newFileList[0]));
                                    delete file.thumbUrl;
                                    fileList = [file];
                                    setFileList([...fileList]);
                                    form.setFieldValue("fileList", [file]);
                                }else{
                                    fileList = newFileList;
                                    setFileList([...fileList]);
                                    form.setFieldValue("fileList", newFileList);
                                }
                                const values = form.getFieldsValue();
                                saveCache(dataBase, values, isEdit);
                            }}
                        >
                            <div ref={uploadRef} className="upload-btn" onClick={() => setTmplModal(true)}>
                                <p className="upload-icon"><PlusOutlined /></p>
                                <p className="text-title">{t("inner.content.img.choose")}</p>
                            </div>
                        </Upload>
                        </ ImgCrop>
                        {
                            fileList.length === 1 && fileList[0].status === "done" && 
                            <div className="challenge-title">
                                <div>
                                    <p className="img-desc newline-omitted">{form.getFieldValue("title")}</p>
                                </div>
                            </div>
                        }
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
                                    width: "100%"
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
                                    width: "200px"
                                }}
                            />
                        </div>

                        <div className="form-item" style={{width: "100%"}}>
                            <p className="title">{t("translation:sort")}</p>
                            <Select
                                mode="tags"
                                value={category}
                                style={{width: "67.3%"}}
                                onChange={changeTags}
                                options={tagsOption}
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

                        {/* 选择发布链 */}
                        {
                            !changeItem &&
                            <Form.Item 
                                label={t("inner.network")}
                                name="chain"
                                rules={[{
                                    required: true,
                                    message: t("inner.rule.network"),
                                }]}
                            >
                                <Select
                                    options={
                                        chainList.map(item => {
                                            return {
                                                value: item.id,
                                                label: (
                                                    <div style={{display: "flex", alignItems: "center", gap: "20px"}}>
                                                        <img src={item?.img} alt="" style={{width: "18px", height: "18px"}} />
                                                        <p>{item?.name}</p>
                                                    </div>
                                                )
                                            }
                                        })
                                    }
                                />
                            </Form.Item>
                        }
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