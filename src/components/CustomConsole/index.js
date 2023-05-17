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
    
    const { question, changeCodeObj, goTest, logs, items } = props;
    const [selectTab, setSelectTab] = useState(tabs[0].key);
    const [hideCase, setHideCase] = useState(false);
    const caseRef = useRef(null);

    useImperativeHandle(ref, () => ({
        changeInput
    }))

    function changeInput(params) {
        caseRef.current.changeValue(params)
    }

    function runCode() {
        setSelectTab(tabs[1].key);
        goTest("tryRun");
    }

    useEffect(() => {
        const flag = question.type === "special_judge_coding" ? true : false;
        setHideCase(flag)
        flag && setSelectTab(tabs[1].key)
    },[])

    return(
        <>
            <div className="CustomConsole">
                <Tab
                    tabs={tabs}
                    selectTab={selectTab}
                    setSelectTab={setSelectTab}
                    hideCase={hideCase}
                />
                <TestCase 
                    className={selectTab === "case" ? "" : "none"}
                    input={question?.input ? question?.input[0] : question.spj_code} 
                    changeCodeObj={changeCodeObj} 
                    ref={caseRef}
                    hideCase={hideCase}
                />
                <Console 
                    className={`${selectTab === "cmd" ? "" : "none"}`}
                    logs={logs} 
                />
            </div>
            <div className="btns">
                {
                    hideCase ?
                    <div></div>
                    :
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
                }
                <Button onClick={() => runCode()}>执行代码</Button>
            </div>
        </>
    )
}

export default forwardRef(CustomConsole)