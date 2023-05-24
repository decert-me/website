import { Button, Dropdown } from "antd";
import {
    PlusOutlined
} from '@ant-design/icons';
import { forwardRef, useImperativeHandle, useState } from "react";
import Coding from "./Coding";
import CodingSpecial from "./CodingSpecial";


/**
 * 
 *     function checkCode(e) {
        setIsLoading(true);
        const { case: cases, spj_code: spj_code, type: type, ...rest } = form.getFieldValue();
        // 用例检测
        let flag = false;
        if (type === "coding") {
            // 普通代码题
            flag = !cases || cases.some(e => !e || Object.keys(e).length !== 2);
        }
        if (type === "special_judge_coding") {
            // 特殊代码题
            flag = !spj_code;
        }
        if (flag) {
            console.log("请将用例补充完整!");
            return
        }
        const inputArr = cases && cases.map(e => e.input);
        const outputArr = cases && cases.map(e => e.output);

        let obj = {
            code: "", //写入的代码
            example_code: e.correctAnswer, //代码示例
            code_snippet: e.code, //代码片段
            lang: e.value
        }
        if (type === "special_judge_coding") {
            // 特殊编程题
            obj.spj_code = spj_code
        }else{
            // 普通编程题
            obj = {
                ...obj,
                input: "",
                example_input: inputArr,
                example_output: outputArr
            }
        }
        codeTest(obj)
        .then(res => {
            if (res?.data?.correct) {
                message.success("成功")
            }else if (res?.data) {
                switch (res.data.status) {
                    case 1:
                        message.error("编译失败")
                        break;
                    case 2:
                        message.error("运行失败")
                        break;
                    case 3:
                        message.error("测试用例未通过")
                        break;
                    default:
                        break;
                }
            }
            setIsLoading(false);
        })
    }
 * 
 * 
 */

function CustomCase(props, ref) {

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