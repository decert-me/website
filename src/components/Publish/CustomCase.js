import { Button, Dropdown, Modal } from "antd";
import {
    PlusOutlined
} from '@ant-design/icons';
import { forwardRef, useImperativeHandle, useState } from "react";
import Coding from "./Coding";
import CodingSpecial from "./CodingSpecial";

function CustomCase(props, ref) {

    const { checkCode } = props;
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
        cancelText: "取消",
        okText: "确认",
        content: (
            <p>确认删除此测试用例？</p>
        )
    };

    function addCase(isSpecial) {
        isSpecial ?
        caseArr.push({
            spj_code: {
                frame: "",
                code: ""
            }
        })
        :
        caseArr.push({
            input: "",
            output: "",
        })
        setCaseArr([...caseArr]);
    }
    
    function deleteCase(index) {
        modal.confirm({...config, onOk: () => {
            caseArr.splice(index,1);
            setCaseArr([...caseArr])
        }});
    }

    function changeValue(value, type, index, key) {
        if (key) {
            caseArr[index][type][key] = value;
        }else{
            caseArr[index][type] = value;
        }
        setCaseArr([...caseArr]);
        console.log(caseArr);
        // TODO: 节流
    }

    function exampleAction(dom, type) {
        const img = document.querySelector(dom);
        img.style.display = type;
        const { top } = document.querySelector(".hover1").getBoundingClientRect();
        img.style.bottom = document.documentElement.offsetHeight - top + 50 + "px";
        img.style.left = (document.documentElement.offsetWidth - img.offsetWidth) / 2 + "px";

        console.log(document.documentElement.offsetWidth);
    }
    
    const items = [
        {
            key: '1',
            className: "hover1",
            label: (
                <p onClick={() => addCase()}>
                    测试用例 
                    <span
                        onMouseEnter={() => exampleAction(".show1", "block")}
                        onMouseLeave={() => exampleAction(".show1", "none")}
                    >
                        ❓

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
                    代码测试用例
                    <span
                        onMouseEnter={() => exampleAction(".show2", "block")}
                        onMouseLeave={() => exampleAction(".show2", "none")}
                    >
                        ❓
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
                                key={i} 
                                onChange={
                                    (e, key) => changeValue(e, "spj_code", i, key)
                                } 
                                defaultValue={e}
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
                                key={i}  
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
                        添加测试用例
                    </Button>
                </Dropdown>
            </div>
            <div className="poa  show1">
                <img src={require("@/assets/images/img/publish-example1.png")} alt="" />
            </div>
            <div className="poa  show2">
                <img src={require("@/assets/images/img/publish-example2.png")} alt="" />
            </div>
        </>
    )
}

export default forwardRef(CustomCase)