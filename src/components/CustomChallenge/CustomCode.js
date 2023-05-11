import { Editor } from '@bytemd/react'
import { useEffect, useState } from "react";
import { useUpdateEffect } from 'ahooks';
import MonacoEditor from '../MonacoEditor';
import CustomConsole from '../CustomConsole';
import { Button } from 'antd';




export default function CustomCode(props) {

    const { question, index } = props;
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
                        />
                        <div className="btns">
                            <Button>执行代码</Button>
                        </div>
                    </div>
                </div>
            }
        </div>
    )   
}