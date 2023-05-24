import { loader } from "@monaco-editor/react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { LoadingOutlined } from '@ant-design/icons';
import MonacoComponent from "./MonacoComponent";



function MonacoEditor(props, ref) {
    
    const {value, onChange, language} = props;
    const { config, init } = loader;
    let [editorIsOk, setEditorIsOk] = useState();
    let [newLang, setNewLang] = useState();

    useImperativeHandle(ref, () => ({
        changeLang
    }))

    function changeLang(params) {
        newLang = params;
        setNewLang(newLang);
        console.log("====>",newLang);
    }

    async function languaegInit(params) {
        switch (language) {
            case "C++":
            case "C":
                changeLang("c")
                break;
            default:
                changeLang(language)
                break;
        }
    }

    async function monacoInit(params) {
        config({
            paths: {
                vs: "https://ipfs.decert.me/lib/monaco-editor@0.36.1"
                // vs: "https://unpkg.com/monaco-editor@0.36.1/min/vs"
            },
            // monaco: monaco
        })
        await init();
        languaegInit();
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
            language={newLang}
        />
        :
        <div style={{height: "calc(100% - 230px)"}}>
            <LoadingOutlined style={{ fontSize: "30px"}} />
        </div>
    )
}
export default forwardRef(MonacoEditor)