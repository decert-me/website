import { Editor } from '@bytemd/react'
import { useEffect, useState } from "react";
import { useUpdateEffect } from 'ahooks';
import MonacoEditor from '../MonacoEditor';




export default function CustomCode(props) {

    const { question } = props;
    let [cacheQuest, setCacheQuest] = useState();
    let [selectCode, setSelectCode] = useState();
    let [selectIndex, setSelectIndex] = useState(0);


    function changeCache(value) {
        cacheQuest[selectIndex] = value;
        setCacheQuest({...cacheQuest});
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
            <div className="code-desc">
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
                </div>
            }
        </div>
    )   
}