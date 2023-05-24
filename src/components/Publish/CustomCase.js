import { Button, Dropdown } from "antd";
import {
    PlusOutlined
} from '@ant-design/icons';
import { useState } from "react";
import Coding from "./Coding";
import CodingSpecial from "./CodingSpecial";


export default function CustomCase(params) {

    let [caseArr, setCaseArr] = useState([]);

    function addCase(isSpecial) {
        isSpecial ?
        caseArr.push({
            spj_code: ""
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

    function changeValue(value, type, index) {
        caseArr[index][type] = value;
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
                                (e) => changeValue(e, "spj_code", i)
                            } 
                            deleteCase={() => deleteCase(i)}
                        /> 
                        :
                        // 普通题
                        <Coding 
                            key={i}  
                            onChange={
                                (e, type) => changeValue(e, type, i)
                            } 
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