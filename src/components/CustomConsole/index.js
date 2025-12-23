import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
import Tab from "./Tab";
import TestCase from "./TestCase";
import Console from "./Console";
import { Button, Dropdown, Space } from "antd";
import {
    UpOutlined,
    CaretRightOutlined
  } from '@ant-design/icons';
import { useTranslation } from "react-i18next";


function CustomConsole(props, ref) {

    const { question, changeCodeObj, goTest, logs, items, loading, submitWithAI, aiLoading } = props;
    const { t } = useTranslation(['publish']);
    const tabs = [
        {
            key: "case",
            label: t("inner.case")
        },
        {
            key: "cmd",
            label: t("inner.run-res")
        }
    ]
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
            {/* 隐藏整个 CustomConsole 区域，只保留按钮行 */}
            {/* <div className="CustomConsole">
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
            </div> */}
            <div className="ai-judge-btns">
                {/* <Dropdown
                    menu={items ? {items} : items}
                    trigger={['click']}
                    placement="topLeft"
                    overlayClassName="example-dropdown"
                    overlayStyle={{
                        width: "300px"
                    }}
                >
                    <a onClick={(e) => e.preventDefault()}>
                    <Space>
                    {t("inner.fill-example")}
                        <UpOutlined />
                    </Space>
                    </a>
                </Dropdown> */}
                {submitWithAI && (
                    <Button
                        loading={aiLoading}
                        onClick={() => submitWithAI()}
                        type="primary"
                    >
                        <CaretRightOutlined />AI判题
                    </Button>
                )}
            </div>
        </>
    )
}

export default forwardRef(CustomConsole)