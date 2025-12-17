import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useUpdateEffect } from 'ahooks';
import MonacoEditor from '../MonacoEditor';
import CustomConsole from '../CustomConsole';
import { codeRun, codeTest } from '@/request/api/quests';
import CustomViewer from "../CustomViewer";
import { Encryption } from "@/utils/Encryption";
import { useTranslation } from "react-i18next";
import { Modal, Tooltip } from "antd";
import { modalNotice } from "@/utils/modalNotice";
import { useLocation } from "react-router-dom";
import { judgeCodeWithAI } from "@/utils/aiJudge";


function CustomCode(props, ref) {

    const { question, reload, token_id, answers, setAnswers, index, isPreview } = props;
    const { t } = useTranslation(['publish','explore']);
    const location = useLocation();
    const editorRef = useRef(null);
    const consoleRef = useRef(null);
    const { decode } = Encryption();
    const key = process.env.REACT_APP_ANSWERS_KEY;

    const [loading, setLoading] = useState();
    const [aiLoading, setAiLoading] = useState(false); // AI判题加载状态
    const [aiResult, setAiResult] = useState(null); // AI判题结果
    let [previewCode, setPreviewCode] = useState([
        { label: t("inner.code-tpl"), value: "tpl", select: true },
        { label: <>{t("inner.code-spl")}&nbsp;&nbsp;&nbsp;<span>({t("preview")})</span></>, value: "spl", select: false }
    ]);     //  预览状态所选代码

    let [items, setItems] = useState();   //  测试用例列表
    let [cacheQuest, setCacheQuest] = useState();
    let [selectCode, setSelectCode] = useState();
    let [selectIndex, setSelectIndex] = useState(0);
    let [editorCode, setEditorCode] = useState();
    let [answerCode, setAnswerCode] = useState();
    let [logs, setLogs] = useState([]);     //  执行代码返回的日志
    let [codeObj, setCodeObj] = useState({
        code: "",
        input: "",
        lang: "",
        quest_index: '',
        token_id
    });

    useImperativeHandle(ref, () => ({
        goTest
    }))

    function addLogs(params) {
        logs = logs.concat(params);
        setLogs([...logs]);
    }

    function changeCache(value) {
        if (isPreview) {
            return
        }
        // 存储至cache中，切换language时不丢失
        cacheQuest.code_snippets[selectIndex].code = value;
        setCacheQuest({...cacheQuest});
    }

    function changeCodeObj(params, key) {
        codeObj[key] = params;
        setCodeObj({...codeObj});
        consoleRef.current.initTab();
    }

    function printLog(res) {
        switch (res.data.status) {
            case 1:
                addLogs([t("inner.run.fail.compile"), res.data.msg])
                break;
            case 2:
                addLogs([t("inner.run.success.compile"), t("inner.run.fail.test"), res.data.msg])
                break;
            case 3:
                addLogs([t("inner.run.success.compile"), t("inner.run.success.test")])
                break;
            default:
                break;
        }
        // 运行成功
        if (res.data.status === 3 && res.data.correct) {
            // 测试用例成功
            addLogs([t("inner.run.success.case")])
        }else if (res.data.status === 3) {
            // 测试用例失败
            addLogs([t("inner.run.fail.case")])
        }
        if (res.data.except_output) {
            addLogs([`${t("inner.run.be")}:\n"${res.data.except_output}"`, `${t("inner.run.af")}:\n"${res.data.output}"`])
        }
        setLoading(false);
    }

    function previewTest() {
        const obj = cacheQuest.code_snippets[selectIndex];
        let testCode = {
            code: obj.code, //写入的代码
            example_code: selectCode.decodeAnswer, //代码示例
            code_snippet: selectCode.code, //代码片段
            lang: obj.lang
        }
        if (question.type === "special_judge_coding") {
            // 特殊编程题
            testCode.spj_code = cacheQuest.spj_code
        }else{
            // 普通编程题
            testCode = {
                ...testCode,
                input: codeObj.input,
                example_input: cacheQuest.input,
                example_output: cacheQuest.output
            }
        }

        addLogs([t("inner.run.start")]);
        let paramsObj = JSON.parse(JSON.stringify(testCode))
        // 编程题特殊处理
        if (cacheQuest?.spj_code) {
            cacheQuest.spj_code.map(e => {
                if (e.code === paramsObj.input) {
                    paramsObj.input = "";
                    paramsObj.spj_code = [e];
                    delete paramsObj.example_input;
                    delete paramsObj.example_output;
                }
            })
        }
        paramsObj.code = obj.code;
        paramsObj.lang = obj.lang;
        paramsObj.quest_index = index;
        codeTest(paramsObj)
        .then(res => {
            res.data ? printLog(res) : setLoading(false);
        })
        .catch(err => {
            addLogs(err.toString());
            setLoading(false);
        })
    }

    async function goTest(params) {
        if (isPreview) {
            Modal.warning({
                ...modalNotice({
                    t,
                    text: t("translation:message.error.preview-test"),
                    onOk: () => {Modal.destroyAll()},
                    icon: "😵"
                }
            )});
            return
        }
        setLoading(true);
        if (cacheQuest.type !== "special_judge_coding" && cacheQuest.type !== "coding") {
            setLoading(false);
            return
        }

        if (isPreview) {
            previewTest()
            return
        }

        const obj = cacheQuest.code_snippets[selectIndex];
        let cache = JSON.parse(localStorage.getItem("decert.cache"));
        if (!params && cache[token_id] && cache[token_id][index] && JSON.stringify(obj.code) === JSON.stringify(cache[token_id][index].code)) {
            // 切换页面时判断是否需要向后端发起判题
            return
        }

        // 代码自测参数
        let paramsObj = JSON.parse(JSON.stringify(codeObj))
        // 编程题特殊处理
        if (cacheQuest?.spj_code) {
            cacheQuest.spj_code.map(e => {
                if (e.code === paramsObj.input) {
                    paramsObj.input = ""
                }
            })
        }
        paramsObj.code = obj.code;
        paramsObj.lang = obj.lang;
        paramsObj.quest_index = index;
        logs = [];
        setLogs(logs);
        addLogs([t("inner.run.start")]);
        await codeRun(paramsObj)
        .then(res => {
            if (res.data) {
                // 写入答案
                const value = {
                    value: obj.code,       // 添加 value 字段
                    correct: res.data.correct,
                    code: obj.code,
                    language: question.languages[selectIndex],
                    type: question.type
                }
                setAnswers(value, index);
                printLog(res);
            }else{
                setLoading(false);
            }
        }).catch(err => {
            addLogs(err.toString());
            setLoading(false);
        })

    }

    // AI 判题函数
    async function submitWithAI() {
        if (isPreview) {
            Modal.warning({
                ...modalNotice({
                    t,
                    text: t("translation:message.error.preview-test"),
                    onOk: () => {Modal.destroyAll()},
                    icon: "😵"
                }
            )});
            return
        }

        const obj = cacheQuest.code_snippets[selectIndex];

        if (!obj.code || obj.code.trim() === '') {
            Modal.warning({
                ...modalNotice({
                    t,
                    text: "请先编写代码再提交",
                    onOk: () => {Modal.destroyAll()},
                    icon: "⚠️"
                }
            )});
            return
        }

        setAiLoading(true);
        // 清空之前的日志，只显示最新的结果
        logs = [];
        setLogs([]);
        addLogs(["正在使用 AI 评判代码..."]);

        try {
            console.log('提交AI判题');

            // 调用 AI 判题（不再传递测试用例）
            const result = await judgeCodeWithAI(
                question.title,
                question.description,
                obj.code,
                obj.lang
            );

            setAiResult(result);

            // 显示 AI 判题结果
            addLogs([
                result.correct ? "✅ AI 判题通过" : "❌ AI 判题未通过",
                `评判理由：${result.reason}`
            ]);

            // 写入答案（按照原有格式）
            const value = {
                value: obj.code,          // 添加 value 字段，保持与其他题型一致
                correct: result.correct,
                code: obj.code,
                language: question.languages[selectIndex],
                type: question.type
            };
            setAnswers(value, index);

            // 显示判题结果弹窗
            Modal.info({
                title: result.correct ? "AI 判题通过 ✅" : "AI 判题未通过 ❌",
                content: (
                    <div style={{
                        maxHeight: '400px',
                        overflowY: 'auto',
                        padding: '10px 0'
                    }}>
                        <p><strong>评判理由：</strong></p>
                        <div style={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            lineHeight: '1.6',
                            marginTop: '10px'
                        }}>
                            {result.reason}
                        </div>
                    </div>
                ),
                width: 600,
                okText: "确定",
                centered: true,
                onOk: () => {
                    Modal.destroyAll();
                }
            });

        } catch (error) {
            console.error('AI 判题失败:', error);
            addLogs([`AI 判题失败: ${error.message}`]);

            Modal.error({
                title: "AI 判题失败",
                content: (
                    <div style={{
                        maxHeight: '300px',
                        overflowY: 'auto',
                        padding: '10px 0'
                    }}>
                        <p>无法完成 AI 判题，请稍后重试。</p>
                        <p style={{
                            marginTop: '10px',
                            color: '#666',
                            fontSize: '14px'
                        }}>
                            错误信息：{error.message}
                        </p>
                    </div>
                ),
                width: 500,
                okText: "确定",
                centered: true,
                onOk: () => {
                    Modal.destroyAll();
                }
            });
        } finally {
            setAiLoading(false);
        }
    }

    function toggleCode() {
        selectCode = cacheQuest.code_snippets[0];
        // 解码示例代码
        if (!selectCode?.decodeAnswer) {
            selectCode.decodeAnswer = eval(decode(selectCode.correctAnswer));
        }

        setSelectCode({...selectCode});
        editorCode = selectCode.code;
        setEditorCode(editorCode);
    }

    // 预览模式下切换代码
    function changeCode(code) {
        // 修改选中menu
        previewCode.forEach(e => {
            e.select = !e.select
        })
        setPreviewCode([...previewCode])
        // 修改代码
        editorCode = code === "tpl" ? selectCode?.code : selectCode?.decodeAnswer;
        setEditorCode(editorCode);
        // 切换编辑器语种
        editorRef.current.changeReadOnly(code !== "tpl" );
    }

    async function revertCode() {
        if (location.pathname === "/preview") {
            editorRef.current.monacoInit();
            return
        }
        const local = localStorage.getItem("decert.cache");
        if (local) {
            let cache = JSON.parse(local);
            cache[token_id][index] = null;
            localStorage.setItem("decert.cache", JSON.stringify(cache));
        }
        await reload(true, index);
        logs = [];
        setLogs([...logs]);
    }

    async function init(isReload) {
        cacheQuest = question;
        if (answers[index] && !isReload) {
            answerCode = answers[index].code;
            setAnswerCode(answerCode);
            cacheQuest.code_snippets[selectIndex].code = answers[index].code;
        }
        setCacheQuest({...cacheQuest});
        toggleCode()

        // 测试用例列表初始化
        let arr = [];
        question?.input && 
        question.input.map((e, i) => {
            arr.push({
                key: i,
                label: (
                    <p onClick={() => consoleRef.current.changeInput(e)}>
                        <strong>{t("inner.example")}{i+1}</strong>&nbsp;&nbsp;&nbsp;&nbsp;<span className="example">{e}</span>
                    </p>
                )
            })
        })
        
        question?.spj_code?.map(e => {
            arr.push({
                key: arr.length,
                label: (
                    <p onClick={() => consoleRef.current.changeInput(e.code, "type")}>
                        <strong>{t("inner.example")}{arr.length + 1}</strong>
                    </p>
                )
            })
        })
        items = arr;
        setItems([...items]);
    }

    // async function updateInit() {
    //     await init(true);
    //     answerCode = null;
    //     setAnswerCode(answerCode);
    //     editorRef.current.monacoInit();
    // }

    useUpdateEffect(() => {
        toggleCode();
    },[selectIndex])

    useEffect(() => {
        init();
    },[])

    return (
        <>

            <div className="CustomCode">
                <div className="code-left">
                    <h4 className='challenge-title'>{t("explore:challenge.title")}
                        #{index + 1}
                        <strong>{question.title}</strong>
                        &nbsp;&nbsp; 
                        {
                            isPreview &&
                            <span className="score">({question.score}分)</span>
                        }
                    </h4>
                    <div className="code-desc">
                        <div className="code-content custom-scroll">
                            <CustomViewer label={question.description} />
                        </div>
                    </div>
                </div>
                {
                    selectCode &&
                    <div className="code-out">
                        <div className="code-menu">
                            <div className="menu-lang">
                                {/* 多语种下拉框 */}
                            </div>
                        </div>
                        <div 
                            className="out-inner"
                        >
                            {/* 还原代码模板 */}
                            <Tooltip 
                                title={t("revert")}
                                arrow={false} 
                                rootClassName="reload-tips" 
                            >
                                <img onClick={revertCode} className="icon-reload" src={require("@/assets/images/img/reload.png")} alt="" />
                            </Tooltip>
                            
                            {
                                isPreview && 
                                <div className="preview-menu">
                                    <ul className="menu">
                                        {
                                            previewCode.map((e, i) => 
                                                <li 
                                                    key={i}
                                                    className={`${e.select ? "active" : ""} ${e.value === "spl" ? "green" : ""}`}
                                                    onClick={() => changeCode(e.value)}
                                                >{e.label}</li>
                                            )
                                        }
                                    </ul>
                                </div>
                            }
                            <MonacoEditor
                                value={answerCode||editorCode}
                                onChange={changeCache}
                                language={selectCode.lang}
                                height={"100%"}
                                ref={editorRef}
                            />
                        </div>
                        <div className="out-content">
                            <CustomConsole
                                question={question}
                                changeCodeObj={changeCodeObj}
                                goTest={goTest}
                                logs={logs}
                                items={items}
                                ref={consoleRef}
                                loading={loading}
                                submitWithAI={submitWithAI}
                                aiLoading={aiLoading}
                            />
                        </div>
                    </div>
                }
            </div>
        </>
    )   
}
export default forwardRef(CustomCode)