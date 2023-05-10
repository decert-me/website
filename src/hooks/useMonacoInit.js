import { useEffect } from "react";
import { monacoLanguage } from "@/components/MonacoEditor/monacoLanguage";
import { useMonaco } from "@monaco-editor/react";




export function useMonacoInit(props) {
    
    const { language } = props;

    const monaco = useMonaco();
    const { languages } = monacoLanguage();

    function solidityInit() {
        console.log("=====>", monaco);
        monaco.languages.register({ id: 'Solidity' });
        monaco.languages.setMonarchTokensProvider('Solidity', languages.solidity);
    }

    async function languageInit() {
        switch (language) {
            case "Solidity":
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