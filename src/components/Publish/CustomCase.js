import { Button, Dropdown, Modal } from "antd";
import {
    PlusOutlined,
    QuestionCircleOutlined
} from '@ant-design/icons';
import { forwardRef, useImperativeHandle, useState } from "react";
import Coding from "./Coding";
import CodingSpecial from "./CodingSpecial";
import { exampleAction } from "@/utils/exampleAction";
import { useTranslation } from "react-i18next";

function CustomCase(props, ref) {

    const { checkCode } = props;
    const { t } = useTranslation(["publish", "translation"]);
    const [modal, contextHolder] = Modal.useModal();
    let [caseArr, setCaseArr] = useState([]);

    useImperativeHandle(ref, () => ({
        caseArr,
        setCaseArr
    }))

    const config = {
        title: '',
        icon: <></>,
        className: "custom-confirm",
        cancelText: t("translation:btn-cancel"),
        okText: t("translation:btn-confirm"),
        content: (
            <p>{t("message.confirm.delete")}</p>
        )
    };

    function addCase(isSpecial) {
        isSpecial ?
        caseArr.push({
            key: Math.random(),
            spj_code: {
                frame: "Hardhat",
                code: ""
            }
        })
        :
        caseArr.push({
            key: Math.random(),
            input: "",
            output: "",
        })
        setCaseArr([...caseArr]);
    }
    
    function deleteCase(index) {
        modal.confirm({...config, onOk: () => {
            caseArr.splice(index,1);
            setCaseArr([...caseArr]);
        }});
    }

    function changeValue(value, type, index, key) {
        if (key) {
            caseArr[index][type][key] = value;
        }else{
            caseArr[index][type] = value;
        }
        setCaseArr([...caseArr]);
        // TODO: 节流
    }

    const items = [
        {
            key: '1',
            className: "hover1",
            label: (
                <p onClick={() => addCase()}>
                    {t("inner.case-out")}
                    <span
                        onMouseEnter={() => exampleAction(".show1", "block", ".hover1", "top")}
                        onMouseLeave={() => exampleAction(".show1", "none", ".hover1", "top")}
                        style={{fontSize: "14px", marginLeft: "6px", display: "inline-block", paddingTop: "1px"}}
                    >
                        <QuestionCircleOutlined />
                    </span>
                </p>
            ),
        },
        {
            type: 'divider',
        },
        {
            key: '2',
            label: (
                <p onClick={() => addCase("special")}>
                    {t("inner.case-code")}
                    <span
                        onMouseEnter={() => exampleAction(".show2", "block", ".hover1", "top")}
                        onMouseLeave={() => exampleAction(".show2", "none", ".hover1", "top")}
                        style={{fontSize: "14px", marginLeft: "6px", display: "inline-block", paddingTop: "1px"}}
                    >
                        <QuestionCircleOutlined />
                    </span>
                </p>
            ),
        }
    ];

    return (
        <>
            <div className="customCase">
                {contextHolder}
                {
                    caseArr.map((e,i) => 
                        "spj_code" in e ?
                            // 特殊题
                            <CodingSpecial
                                key={e.key} 
                                onChange={
                                    (e, key) => changeValue(e, "spj_code", i, key)
                                } 
                                defaultValue={e}
                                className={`coding-special${i}`}
                                deleteCase={() => deleteCase(i)}
                                checkCode={async() => {
                                    return await checkCode({
                                        spj_code: [e.spj_code]
                                    })
                                }}
                            /> 
                            :
                            // 普通题
                            <Coding 
                                key={e.key}  
                                onChange={
                                    (e, type) => changeValue(e, type, i)
                                } 
                                defaultValue={e}
                                deleteCase={() => deleteCase(i)}
                                checkCode={async() => {
                                    return await checkCode({
                                        input: [],
                                        example_input: [e.input],
                                        example_output: [e.output]
                                    })
                                }}
                            />
                    )
                }
                <Dropdown
                    menu={{
                        items,
                    }}
                    overlayClassName="customCaseMenu"
                    placement="bottom"
                    trigger="click"
                    getPopupContainer={() => document.querySelector(".addCase")}
                    arrow={{
                        pointAtCenter: true,
                    }}
                >
                    <Button 
                        className="addCase" 
                        type="dashed" 
                        icon={<PlusOutlined />}
                        block
                    >
                        {t("inner.add-case")}
                    </Button>
                </Dropdown>
            </div>
            <div className="poa  show1">
                <img src={require(`@/assets/images/img/${t("inner.ex-case-nrm")}`)} alt="" />
            </div>
            <div className="poa  show2">
                <img src={require(`@/assets/images/img/${t("inner.ex-case-code")}`)} alt="" />
            </div>
        </>
    )
}

export default forwardRef(CustomCase)