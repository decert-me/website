import { loader } from "@monaco-editor/react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { LoadingOutlined } from '@ant-design/icons';
import MonacoComponent from "./MonacoComponent";



function MonacoEditor(props, ref) {
    
    const {value, onChange, language, height} = props;
    const { config, init } = loader;
    let [editorIsOk, setEditorIsOk] = useState();
    let [newLang, setNewLang] = useState();
    let [readOnly, setReadOnly] = useState(false);
    let [key, setKey] = useState();

    useImperativeHandle(ref, () => ({
        changeLang,changeReadOnly,monacoInit
    }))

    function changeLang(params) {
        newLang = params;
        setNewLang(newLang);
    }

    function changeReadOnly(params) {
        readOnly = params;
        setReadOnly(readOnly);
    }

    function languaegInit(params) {
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
        setEditorIsOk(false);
        key = Date.now();
        setKey(key);
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
    },[value])

    return (
        editorIsOk ?
        <div key={key} style={{height: "100%"}}>
            <MonacoComponent
                value={value}
                onChange={onChange}
                language={newLang}
                height={height}
                readOnly={readOnly}
            />
        </div>
        :
        <div style={{height: height ? height : "calc(100% - 230px)"}}>
            <LoadingOutlined style={{ fontSize: "30px"}} />
        </div>
    )
}
export default forwardRef(MonacoEditor)