import { useEffect, useState } from "react";
import { useUpdateEffect } from 'ahooks';
import MonacoEditor from '../MonacoEditor';
import CustomConsole from '../CustomConsole';
import { codeTest } from '@/request/api/quests';




export default function CustomCode(props) {

    const { question, token_id } = props;
    let [cacheQuest, setCacheQuest] = useState();
    let [selectCode, setSelectCode] = useState();
    let [selectIndex, setSelectIndex] = useState(0);
    let [codeObj, setCodeObj] = useState({
        code: "",
        input: "",
        lang: "",
        quest_index: '',
        token_id: Number(token_id)
    });


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
        const obj = cacheQuest.code_snippets[selectIndex];
        codeObj.code = obj.code;
        codeObj.lang = obj.lang;
        codeObj.quest_index = selectIndex;
        setCodeObj({...codeObj})
        codeTest(codeObj)
        .then(res => {
            console.log('res ===>',res);
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
                <div dangerouslySetInnerHTML={{__html: question.description}}>
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
                        />
                    </div>
                </div>
            }
        </div>
    )   
}