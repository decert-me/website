import { useEffect, useState } from "react";
import Editor, { loader } from "@monaco-editor/react";
import { LoadingOutlined } from '@ant-design/icons';
import { useMonacoInit } from "@/hooks/useMonacoInit";


export default function MonacoComponent(props) {
    const { value, onChange, language } = props;
    const { config, init } = loader;
    let [editorIsOk, setEditorIsOk] = useState();
    const { languageInit } = useMonacoInit({
        language: language
    })
    
    const options = {
        minimap: { enabled: false },  // 隐藏侧边栏
    };

    async function monacoInit(params) {
        config({
            paths: {
                vs: "https://unpkg.com/monaco-editor@0.36.1/min/vs"
            },
            // monaco: monaco
        })
        await init();
        setEditorIsOk(true);
    }

    useEffect(() => {
        monacoInit();
    },[])

    return (
        editorIsOk &&
        <Editor
            // width="800"
            height="300px"
            theme="light"     // light || vs-dark
            language={language}
            value={value}
            options={options}
            onChange={onChange}
            loading={<LoadingOutlined style={{ fontSize: "30px"}} />}
            beforeMount={languageInit}
        /> 
    )
}