import { useState } from "react"
import Tab from "./Tab";
import TestCase from "./TestCase";
import Console from "./Console";
import { Button, Dropdown, Space } from "antd";
import {
    UpOutlined
  } from '@ant-design/icons';

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

export default function CustomConsole(props) {
    
    const { question, changeCodeObj, goTest, logs, items } = props;
    const [selectTab, setSelectTab] = useState(tabs[0].key);
    

    function runCode() {
        setSelectTab(tabs[1].key);
        goTest();
    }

    function switchTab() {
        
        switch (selectTab) {
            case "case":
                return <TestCase input={question.input[0]} changeCodeObj={changeCodeObj} />
            case "cmd":
                return <Console logs={logs} />
            default:
                break;
        }
    }

    return(
        <>
            <div className="CustomConsole">
                <Tab
                    tabs={tabs}
                    selectTab={selectTab}
                    setSelectTab={setSelectTab}
                />
                {switchTab()}
            </div>
            <div className="btns">
                <Dropdown
                    menu={items ? {items} : items}
                    trigger={['click']}
                    placement="top"
                >
                    <a onClick={(e) => e.preventDefault()}>
                    <Space>
                        Click me
                        <UpOutlined />
                    </Space>
                    </a>
                </Dropdown>
                <Button onClick={() => runCode()}>执行代码</Button>
            </div>
        </>
    )
}