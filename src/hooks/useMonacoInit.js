import { useEffect } from "react";
import { monacoLanguage } from "@/components/MonacoEditor/monacoLanguage";




export function useMonacoInit(props) {
    
    const { language, monaco } = props;

    const { languages } = monacoLanguage();

    function solidityInit() {
        monaco.languages.register({ id: 'solidity' });
        monaco.languages.setMonarchTokensProvider('solidity', languages.solidity);
    }

    function init() {
        switch (language) {
            case "solidity":
                solidityInit();
                break;
        
            default:
                break;
        }
    }

    useEffect(() => {
        monaco && init();
    },[monaco])
}