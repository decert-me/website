import Editor, { useMonaco } from "@monaco-editor/react";
import {
    LoadingOutlined,
} from '@ant-design/icons';
import { useMonacoInit } from "@/hooks/useMonacoInit";


export default function MonacoEditor(params) {
    const { value, onChange, language } = props;
    const monaco = useMonaco();
    useMonacoInit({
        language: language,
        monaco: monaco
    })
    
    const options = {
        minimap: { enabled: false },  // 隐藏侧边栏
    };

    return (
        <Editor
            // width="800"
            height="300px"
            theme="light"     // light || vs-dark
            language={language}
            value={value}
            options={options}
            onChange={onChange}
            loading={<LoadingOutlined style={{color: "#fff", fontSize: "30px"}} />}
        /> 
    )
}