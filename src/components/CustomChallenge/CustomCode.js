import { useEffect, useRef, useState } from "react";
import { useUpdateEffect } from 'ahooks';
import MonacoEditor from '../MonacoEditor';
import CustomConsole from '../CustomConsole';
import { codeTest } from '@/request/api/quests';




export default function CustomCode(props) {

    const { question, token_id } = props;
    const consoleRef = useRef(null);

    let [items, setItems] = useState();   //  测试用例列表
    let [cacheQuest, setCacheQuest] = useState();
    let [selectCode, setSelectCode] = useState();
    let [selectIndex, setSelectIndex] = useState(0);
    let [logs, setLogs] = useState([]);     //  执行代码返回的日志
    let [codeObj, setCodeObj] = useState({
        code: "",
        input: "",
        lang: "",
        quest_index: '',
        token_id: Number(token_id)
    });


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

    function goTest(params) {
        addLogs(["开始编译..."]);
        const obj = cacheQuest.code_snippets[selectIndex];
        codeObj.code = obj.code;
        codeObj.lang = obj.lang;
        codeObj.quest_index = selectIndex;
        setCodeObj({...codeObj})
        codeTest(codeObj)
        .then(res => {
            console.log('res ===>',res);
            if (res.data) {
                switch (res.data.status) {
                    case 1:
                        addLogs(["❌编译失败", res.data.msg])
                        break;
                    case 2:
                        addLogs(["✅编译成功", "❌运行失败", res.data.msg])
                        break;
                    default:
                        addLogs(["✅编译成功", "✅运行成功"])
                        break;
                }
                // 运行成功
                if (res.data.status === 3 && res.data.correct) {
                    // 测试用例成功
                    addLogs(["✅测试用例通过"])
                }else{
                    // 测试用例失败
                    addLogs(["❌测试用例未通过", `预期输出结果:\n${res.data.last_expect}`, `实际输出结果:\n${res.data.last_output}`])
                }
            }
        })
    }

    function toggleCode() {
        selectCode = cacheQuest.code_snippets[0];
        setSelectCode({...selectCode});
    }

    async function init(params) {
        cacheQuest = question;
        setCacheQuest({...cacheQuest});
        toggleCode()

        // 测试用例列表初始化
        let arr = [];
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
                <div className="markdown-body" dangerouslySetInnerHTML={{__html: question.description}}>
                </div>
            </div>
            {
                selectCode &&
                <div className="code-out">
                    <MonacoEditor
                        value={selectCode.code}
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
                        />
                    </div>
                </div>
            }
        </div>
    )   
}