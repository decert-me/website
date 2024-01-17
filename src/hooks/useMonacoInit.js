import { useEffect } from "react";
import { monacoLanguage } from "@/components/MonacoEditor/monacoLanguage";
import { useMonaco } from "@monaco-editor/react";




export function useMonacoInit(props) {
    
    const { language } = props;

    const monaco = useMonaco();
    const { tokens, config } = monacoLanguage();

    function solidityInit() {
        if (!monaco) {
            return
        }
        monaco.languages.register({ id: 'Solidity' });
        monaco.languages.setMonarchTokensProvider('Solidity', tokens.solidity);
        monaco.languages.setLanguageConfiguration('Solidity', config.solidity);
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