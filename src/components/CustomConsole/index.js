import { useState } from "react"
import Tab from "./Tab";
import TestCase from "./TestCase";
import Console from "./Console";



export default function CustomConsole(props) {
    
    const { question } = props;

    const tabs = [
        {
            key: "case",
            label: "测试用例"
        },
        {
            key: "cmd",
            label: "代码执行结果"
        }
    ]
    
    const [selectTab, setSelectTab] = useState(tabs[0].key);

    function switchTab(params) {
        
        switch (selectTab) {
            case "case":
                return <TestCase input={question.input} />
            case "cmd":
                return <Console />
            default:
                break;
        }
    }

    return(
        <div className="CustomConsole">
            <Tab
                tabs={tabs}
                selectTab={selectTab}
                setSelectTab={setSelectTab}
            />
            {switchTab()}
        </div>
    )
}