import { loader } from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { LoadingOutlined } from '@ant-design/icons';
import MonacoComponent from "./MonacoComponent";



export default function MonacoEditor(props) {
    
    const {value, onChange, language} = props;
    const { config, init } = loader;
    let [editorIsOk, setEditorIsOk] = useState();

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
        editorIsOk ?
        <MonacoComponent
            value={value}
            onChange={onChange}
            language={language}
        />
        :
        <LoadingOutlined style={{ fontSize: "30px"}} />
    )
}