import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useUpdateEffect } from 'ahooks';
import MonacoEditor from '../MonacoEditor';
import CustomConsole from '../CustomConsole';
import { codeRun, codeTest } from '@/request/api/quests';
import CustomViewer from "../CustomViewer";
import { Segmented } from "antd";
import { Encryption } from "@/utils/Encryption";


const previewTabs = [
    {
        label: "代码片段", 
        value: "code"
    },
    {
        label: "示例代码",
        value: "correctAnswer"
    }
]

export default forwardRef (function CustomCode(props, ref) {

    const { question, token_id, answers, setAnswers, saveAnswer, index, isPreview } = props;
    const consoleRef = useRef(null);
    const { decode } = Encryption();
    const key = process.env.REACT_APP_ANSWERS_KEY;

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
    }

    function printLog(res) {
        switch (res.data.status) {
            case 1:
                addLogs(["❌编译失败", res.data.msg])
                break;
            case 2:
                addLogs(["✅编译成功", "❌运行失败", res.data.msg])
                break;
            case 3:
                addLogs(["✅编译成功", "✅运行成功"])
            default:
                break;
        }
        // 运行成功
        if (res.data.status === 3 && res.data.correct) {
            // 测试用例成功
            addLogs(["✅测试用例通过"])
        }else if (res.data.status === 3) {
            // 测试用例失败
            addLogs(["❌测试用例未通过"])
        }
        if (res.data.except_output) {
            addLogs([`预期输出结果:\n${res.data.except_output}`, `实际输出结果:\n${res.data.output}`])
        }
        setLoading(false);
    }

    function previewTest(params) {
        const obj = cacheQuest.code_snippets[selectIndex];
        let testCode = {
            code: obj.code, //写入的代码
            example_code: selectCode.correctAnswer, //代码示例
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
        codeTest(testCode)
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
        addLogs(["开始编译..."]);
        codeObj.code = obj.code;
        codeObj.lang = obj.lang;
        codeObj.quest_index = index;
        // codeObj.type = params;
        setCodeObj({...codeObj})
        await codeRun(codeObj)
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
        selectCode.correctAnswer = eval(decode(key, selectCode.correctAnswer));

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
                label: <p onClick={() => consoleRef.current.changeInput(e)}>示例{i+1}<span>{e}</span></p>
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
            <div className="code-desc custom-scroll">
                <p className="code-title">{question.title}</p>
                <CustomViewer label={question.description} />
            </div>
            {
                selectCode &&
                <div className="code-out">
                    <div className="code-menu">
                        <div className="menu-lang">
                            {/* 多语种下拉框 */}
                        </div>
                        <div className="menu-preview">
                            {/* 预览模式下 ==> 代码片段 : 示例代码 */}
                            <Segmented 
                                options={previewTabs.map(e => e.label)} 
                                defaultValue={"代码片段"}
                                onChange={(e) => togglePreviewCode(e)}
                            />
                        </div>
                    </div>
                    <MonacoEditor
                        value={editorCode}
                        onChange={changeCache}
                        language={selectCode.lang}
                    />
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
})