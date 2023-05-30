import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
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

function CustomConsole(props, ref) {
    
    const { question, changeCodeObj, goTest, logs, items, loading } = props;
    const [selectTab, setSelectTab] = useState(tabs[0].key);
    const caseRef = useRef(null);

    useImperativeHandle(ref, () => ({
        changeInput,
        initTab
    }))

    function changeInput(params, type) {
        caseRef.current.changeValue(params, type)
    }

    function initTab(params) {
        setSelectTab(tabs[0].key);
    }

    function runCode() {
        setSelectTab(tabs[1].key);
        goTest("tryRun");
    }

    return(
        <>
            <div className="CustomConsole">
                <Tab
                    tabs={tabs}
                    selectTab={selectTab}
                    setSelectTab={setSelectTab}
                />
                <TestCase 
                    className={selectTab === "case" ? "" : "none"}
                    input={question?.input ? question?.input[0] : question.spj_code} 
                    changeCodeObj={changeCodeObj} 
                    ref={caseRef}
                />
                <Console 
                    className={`${selectTab === "cmd" ? "" : "none"}`}
                    logs={logs} 
                />
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
                <Button loading={loading} onClick={() => runCode()}>执行代码</Button>
            </div>
        </>
    )
}

export default forwardRef(CustomConsole)