import { forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useUpdateEffect } from 'ahooks';
import MonacoEditor from '../MonacoEditor';
import CustomConsole from '../CustomConsole';
import { codeRun, codeTest } from '@/request/api/quests';
import CustomViewer from "../CustomViewer";
import { Segmented } from "antd";
import { Encryption } from "@/utils/Encryption";
import { useTranslation } from "react-i18next";
import MyContext from "@/provider/context";


const previewTabs = [
    {
        label: "代码片段", 
        value: "code"
    },
    {
        label: "示例代码",
        value: "decodeAnswer"
    }
]

function CustomCode(props, ref) {

    const { question, token_id, answers, setAnswers, saveAnswer, index, isPreview } = props;
    const { t } = useTranslation(['publish']);
    const consoleRef = useRef(null);
    const { decode } = Encryption();
    const key = process.env.REACT_APP_ANSWERS_KEY;
    const { isMobile } = useContext(MyContext);

    const [loading, setLoading] = useState();
    let [items, setItems] = useState();   //  测试用例列表
    let [cacheQuest, setCacheQuest] = useState();
    let [selectCode, setSelectCode] = useState();
    let [selectIndex, setSelectIndex] = useState(0);
    let [editorCode, setEditorCode] = useState();
    let [logs, setLogs] = useState([]);     //  执行代码返回的日志
    let [codeObj, setCodeObj] = useState({
        code: "",
        input: "",
        lang: "",
        quest_index: '',
        token_id: Number(token_id)
    });

    useImperativeHandle(ref, () => ({
        goTest
    }))

    function addLogs(params) {
        logs = logs.concat(params);
        setLogs([...logs]);
    }

    function changeCache(value) {
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
    }

    async function goTest(params) {
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
        if (!params && cache[token_id][index] && JSON.stringify(obj.code) === JSON.stringify(cache[token_id][index].code)) {
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

        addLogs([t("inner.run.start")]);
        await codeRun(paramsObj)
        .then(res => {
            if (res.data) {
                // 写入答案
                answers[index] = {
                    correct: res.data.correct,
                    code: obj.code,
                    language: question.languages[selectIndex],
                    type: question.type
                }
                setAnswers([...answers]);
                saveAnswer();
                printLog(res);
            }else{
                setLoading(false);
            }
        })

    }

    function togglePreviewCode(e) {
        const key = previewTabs.filter(ele => e === ele.label)[0].value;
        editorCode = selectCode[key];
        setEditorCode(editorCode);

        cacheQuest.code_snippets[selectIndex].code = editorCode;
        setCacheQuest({...cacheQuest})
    }

    function toggleCode() {
        selectCode = cacheQuest.code_snippets[0];
        // 解码示例代码
        if (!selectCode?.decodeAnswer) {
            selectCode.decodeAnswer = eval(decode(key, selectCode.correctAnswer));
        }

        setSelectCode({...selectCode});
        editorCode = selectCode.code;
        setEditorCode(editorCode);

    }

    async function init(params) {
        cacheQuest = question;
        if (answers[index]) {
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

    useUpdateEffect(() => {
        toggleCode();
    },[selectIndex])

    useEffect(() => {
        init();
    },[])

    return (
        <div className="CustomCode">
            <div className="code-desc">
                <p className="code-title">{question.title}</p>
                <div className="line" />
                <div className="code-content custom-scroll">
                    <CustomViewer label={question.description} />
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
                        <MonacoEditor
                            value={editorCode}
                            onChange={changeCache}
                            language={selectCode.lang}
                            height={ isMobile ? "100%" : "calc(100% - 14px)"}
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
                        />
                    </div>
                </div>
            }
        </div>
    )   
}
export default forwardRef(CustomCode)