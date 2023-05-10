import { useEffect } from "react";
import { monacoLanguage } from "@/components/MonacoEditor/monacoLanguage";
import { useMonaco } from "@monaco-editor/react";




export function useMonacoInit(props) {
    
    const { language } = props;

    const monaco = useMonaco();
    const { languages } = monacoLanguage();

    function solidityInit() {
        monaco.languages.register({ id: 'solidity' });
        monaco.languages.setMonarchTokensProvider('solidity', languages.solidity);
    }

    async function languageInit() {
        switch (language) {
            case "solidity":
                solidityInit();
                break;
        
            default:
                break;
        }
    }

    return {
        languageInit
    }
}