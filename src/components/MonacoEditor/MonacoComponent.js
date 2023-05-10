import Editor from "@monaco-editor/react";
import { LoadingOutlined } from '@ant-design/icons';
import { useMonacoInit } from "@/hooks/useMonacoInit";


export default function MonacoComponent(props) {
    const { value, onChange, language } = props;
    const { languageInit } = useMonacoInit({
        language: language
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
            loading={<LoadingOutlined style={{ fontSize: "30px"}} />}
            beforeMount={languageInit}
        /> 
    )
}