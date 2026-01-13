import i18n from 'i18next';
import ImgCrop from 'antd-img-crop';
import { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Form, Input, InputNumber, Modal, Radio, Select, Spin, Upload, message } from "antd";
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
import { generateChallengeWithAI, getDefaultPrompt } from '@/utils/aiGenerateChallenge';


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

    // AI 生成挑战相关状态
    const [articleUrl, setArticleUrl] = useState('');           //  文章链接
    const [questionType, setQuestionType] = useState('选择题');  //  题目类型
    const [questionCount, setQuestionCount] = useState(5);      //  题目数量（仅选择题和填空题）
    const [aiPrompt, setAiPrompt] = useState('');               //  AI 提示词
    const [aiGenerating, setAiGenerating] = useState(false);    //  AI 生成中
    const [aiResultModal, setAiResultModal] = useState(false);  //  AI 结果弹窗
    const [finalPrompt, setFinalPrompt] = useState('');         //  最终发送给 AI 的提示词
    const [aiResponse, setAiResponse] = useState('');           //  AI 的原始回复
    const [manualArticleContent, setManualArticleContent] = useState('');  //  手动粘贴的文章内容
    const [showManualInput, setShowManualInput] = useState(false);  //  是否显示手动粘贴输入框
    
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

    // AI 生成挑战
    async function handleGenerateChallenge() {
        try {
            // 验证文章链接
            if (!articleUrl || !articleUrl.trim()) {
                message.warning('请输入文章链接');
                return;
            }

            setAiGenerating(true);

            // 构建完整的提示词（包含 URL）
            const userPrompt = aiPrompt || getDefaultPrompt(questionType, tagsOption, chainList);

            // 根据题型添加题目数量要求
            let questionCountRequirement = '';
            if (questionType === '选择题' || questionType === '填空题') {
                questionCountRequirement = `\n\n**重要：请生成 ${questionCount} 道${questionType}。**`;
            }

            const fullPrompt = `${userPrompt}${questionCountRequirement}

文章链接：${articleUrl}

请访问上述链接，阅读文章内容，然后根据文章内容生成一个完整的${questionType}挑战。`;

            // 保存最终提示词用于显示
            setFinalPrompt(fullPrompt);

            // 显示结果弹窗并开始生成
            setAiResultModal(true);
            message.loading({ content: `正在使用 AI 生成${questionType}挑战...`, key: 'aiGenerate' });

            // 调用 AI 生成题目
            const { result, rawResponse } = await generateChallengeWithAI(
                articleUrl,
                questionType,
                aiPrompt,
                tagsOption,
                chainList,
                questionCount,  // 传递题目数量
                manualArticleContent  // 传递手动粘贴的文章内容
            );

            // 保存 AI 原始回复
            setAiResponse(rawResponse);

            message.success({ content: 'AI 生成成功！', key: 'aiGenerate', duration: 2 });

            // 回填表单
            fillFormWithAIResult(result);

        } catch (error) {
            console.error('AI 生成失败:', error);

            // 如果是获取文章内容失败，显示手动粘贴输入框
            if (error.message && error.message.includes('无法获取文章内容')) {
                setShowManualInput(true);
            }

            message.error({
                content: error.message || 'AI 生成失败，请重试',
                key: 'aiGenerate',
                duration: 3
            });
        } finally {
            setAiGenerating(false);
        }
    }

    // 将 AI 生成的结果回填到表单
    function fillFormWithAIResult(result) {
        // 设置标题
        if (result.title) {
            form.setFieldValue('title', result.title);
        }

        // 设置描述
        if (result.description) {
            form.setFieldValue('desc', result.description);
        }

        // 设置难度
        if (typeof result.difficulty !== 'undefined') {
            form.setFieldValue('difficulty', result.difficulty);
        }

        // 设置预计时间
        if (result.estimatedTime) {
            form.setFieldValue('time', result.estimatedTime);
        }

        // 设置链ID（仅创建模式）
        if (result.chainId && !isEdit) {
            form.setFieldValue('chain', result.chainId);
        }

        // 设置分类
        if (result.categories && Array.isArray(result.categories)) {
            setCategory(result.categories);
        }

        // 设置及格分
        if (result.passingScore) {
            form.setFieldValue('score', result.passingScore);
        }

        // 设置推荐教程
        if (result.tutorials && Array.isArray(result.tutorials)) {
            // 将教程数组转换为CustomEditor需要的格式
            form.setFieldValue('editor', JSON.stringify(result.tutorials));
        }

        // 设置题目
        if (result.questions && Array.isArray(result.questions)) {
            changeForm('questions', result.questions);
        }

        message.success('挑战内容已自动填充到表单中，请检查并调整后再发布');
    }

    // 题目类型改变时更新默认提示词
    function handleQuestionTypeChange(type) {
        setQuestionType(type);
        // 如果用户没有自定义提示词，则更新为新类型的默认提示词
        const currentDefaultPrompt = getDefaultPrompt(questionType, tagsOption, chainList);
        if (!aiPrompt || aiPrompt === currentDefaultPrompt) {
            setAiPrompt(getDefaultPrompt(type, tagsOption, chainList));
        }
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

    // 初始化 AI 提示词
    useEffect(() => {
        if (tagsOption.length > 0 && chainList.length > 0) {
            setAiPrompt(getDefaultPrompt(questionType, tagsOption, chainList));
        }
    }, [tagsOption, chainList]);

    useUpdateEffect(() => {
        if (!transactionLoading) {
            clearDataBase(dataBase);
        }
    },[transactionLoading])

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
                    {/* AI 生成挑战区域 */}
                    <div className="ai-generate-section" style={{
                        background: '#f5f5f5',
                        padding: '20px',
                        borderRadius: '8px',
                        marginBottom: '24px'
                    }}>
                        <h4 style={{ marginBottom: '16px', color: '#1890ff' }}>
                            AI 辅助生成挑战 (可选)
                        </h4>

                        {/* 文章链接 */}
                        <Form.Item
                            label="文章链接"
                            style={{ marginBottom: '16px' }}
                        >
                            <Input.Group compact>
                                <Input
                                    style={{ width: 'calc(100% - 120px)' }}
                                    placeholder="输入文章 URL，例如: https://learnblockchain.cn/article/23208"
                                    value={articleUrl}
                                    onChange={(e) => setArticleUrl(e.target.value)}
                                />
                                <Button
                                    type="primary"
                                    style={{ width: '120px' }}
                                    loading={aiGenerating}
                                    onClick={handleGenerateChallenge}
                                >
                                    AI创建挑战
                                </Button>
                            </Input.Group>
                            <div style={{ marginTop: '8px', color: '#666', fontSize: '12px' }}>
                                AI 将直接访问链接并根据文章内容生成题目
                            </div>
                        </Form.Item>

                        {/* 题目类型 */}
                        <Form.Item
                            label="题目类型"
                            style={{ marginBottom: '16px' }}
                        >
                            <Radio.Group
                                value={questionType}
                                onChange={(e) => handleQuestionTypeChange(e.target.value)}
                            >
                                <Radio value="选择题">选择题</Radio>
                                <Radio value="填空题">填空题</Radio>
                                <Radio value="编程题">编程题</Radio>
                                <Radio value="开放题">开放题</Radio>
                            </Radio.Group>
                        </Form.Item>

                        {/* 题目数量（仅选择题和填空题显示） */}
                        {(questionType === '选择题' || questionType === '填空题') && (
                            <Form.Item
                                label="题目数量"
                                style={{ marginBottom: '16px' }}
                            >
                                <InputNumber
                                    min={1}
                                    value={questionCount}
                                    onChange={(value) => setQuestionCount(value)}
                                    style={{ width: '120px' }}
                                />
                                <span style={{ marginLeft: '8px', color: '#666', fontSize: '12px' }}>
                                    AI 将生成 {questionCount} 道{questionType}
                                </span>
                            </Form.Item>
                        )}

                        {/* 手动粘贴文章内容（仅在获取失败时显示） */}
                        {showManualInput && (
                            <Form.Item
                                label="文章内容"
                                style={{ marginBottom: '16px' }}
                            >
                                <TextArea
                                    rows={6}
                                    placeholder="无法自动获取文章内容，请手动粘贴文章内容到这里..."
                                    value={manualArticleContent}
                                    onChange={(e) => setManualArticleContent(e.target.value)}
                                />
                                <div style={{ marginTop: '8px', color: '#ff4d4f', fontSize: '12px' }}>
                                    提示：自动获取文章内容失败，请手动粘贴文章内容。粘贴后点击"AI 生成挑战"按钮即可。
                                </div>
                            </Form.Item>
                        )}

                        {/* AI 提示词 */}
                        <Form.Item
                            label="AI 提示词"
                            style={{ marginBottom: 0 }}
                        >
                            <TextArea
                                rows={4}
                                placeholder="输入自定义的 AI 提示词，或使用默认提示词"
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                            />
                            <div style={{ marginTop: '8px', color: '#666', fontSize: '12px' }}>
                                提示：修改题目类型会自动更新默认提示词。你可以根据需要自定义提示词内容。
                            </div>
                        </Form.Item>
                    </div>

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
                            isEdit={isEdit}
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

                {/* AI 生成结果弹窗 */}
                <Modal
                    title="AI 生成挑战 - 详细信息"
                    open={aiResultModal}
                    onCancel={() => setAiResultModal(false)}
                    width={900}
                    footer={[
                        <Button key="close" onClick={() => setAiResultModal(false)}>
                            关闭
                        </Button>
                    ]}
                    bodyStyle={{
                        maxHeight: '70vh',
                        overflow: 'auto'
                    }}
                >
                    {aiGenerating && (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <Spin size="large" />
                            <p style={{ marginTop: '16px', color: '#666' }}>
                                AI 正在生成{questionType}，请稍候...
                            </p>
                        </div>
                    )}

                    {!aiGenerating && finalPrompt && (
                        <div>
                            {/* 完整提示词 */}
                            <div style={{ marginBottom: '24px' }}>
                                <h4 style={{ color: '#1890ff', marginBottom: '12px' }}>
                                    📝 完整的 AI 提示词：
                                </h4>
                                <div style={{
                                    background: '#f5f5f5',
                                    padding: '16px',
                                    borderRadius: '4px',
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: 'monospace',
                                    fontSize: '13px',
                                    lineHeight: '1.6',
                                    border: '1px solid #d9d9d9'
                                }}>
                                    {finalPrompt}
                                </div>
                            </div>

                            {/* AI 回复 */}
                            {aiResponse && (
                                <div>
                                    <h4 style={{ color: '#52c41a', marginBottom: '12px' }}>
                                        🤖 AI 的完整回复：
                                    </h4>
                                    <div style={{
                                        background: '#f0f9ff',
                                        padding: '16px',
                                        borderRadius: '4px',
                                        whiteSpace: 'pre-wrap',
                                        fontFamily: 'monospace',
                                        fontSize: '13px',
                                        lineHeight: '1.6',
                                        border: '1px solid #91d5ff'
                                    }}>
                                        {JSON.stringify(JSON.parse(aiResponse), null, 2)}
                                    </div>
                                    <div style={{
                                        marginTop: '12px',
                                        padding: '12px',
                                        background: '#e6f7ff',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        color: '#0050b3'
                                    }}>
                                        ✅ 题目已自动添加到表单中，请检查并调整后再发布
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </Modal>
            </div>
        </Spin>
    )
}