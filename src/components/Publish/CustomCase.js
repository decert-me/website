import { Button, Dropdown } from "antd";
import {
    PlusOutlined
} from '@ant-design/icons';
import { forwardRef, useImperativeHandle, useState } from "react";
import Coding from "./Coding";
import CodingSpecial from "./CodingSpecial";

function CustomCase(props, ref) {

    const { checkCode } = props;
    let [caseArr, setCaseArr] = useState([]);

    useImperativeHandle(ref, () => ({
        caseArr,
        setCaseArr
    }))

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
        caseArr.splice(index,1);
        setCaseArr([...caseArr])
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
    
    const items = [
        {
            key: '1',
            label: (
                <p onClick={() => addCase()}>
                    测试用例
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
                </p>
            ),
        }
    ];

    return (
        <div className="customCase">
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
    )
}

export default forwardRef(CustomCase)