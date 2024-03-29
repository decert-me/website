import Editor from "@monaco-editor/react";
import { LoadingOutlined } from '@ant-design/icons';
import { useMonacoInit } from "@/hooks/useMonacoInit";
import { useContext } from "react";
import MyContext from "@/provider/context";


export default function MonacoComponent(props) {
    const { value, defaultValue, onChange, language, height, readOnly } = props;
    const { isMobile } = useContext(MyContext);
    const { languageInit } = useMonacoInit({
        language: language
    })
    
    const options = {
        minimap: { enabled: false },  // 隐藏侧边栏
        wordWrap: isMobile ? "on" : "off",
        readOnly: readOnly
    };

    return (
        <Editor
            // width="800"
            height={height ? height : "calc(100% - 230px)"}
            theme="light"     // light || vs-dark
            language={language}
            value={value}
            defaultValue={defaultValue}
            options={options}
            onChange={onChange}
            loading={<LoadingOutlined style={{ fontSize: "30px"}} />}
            beforeMount={languageInit}
        /> 
    )
}