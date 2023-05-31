import { Button, Select } from "antd";
import {
    CaretRightOutlined
} from '@ant-design/icons';
import MonacoEditor from "../MonacoEditor";
import CustomIcon from "../CustomIcon";
import { useEffect, useRef, useState } from "react";
import { useUpdateEffect } from "ahooks";

const frame = [
    {
      label: 'Solidity',
      options: [
        {
          label: 'Foundry',
          value: 'Foundry'
        },
        {
          label: 'Hardhat',
          value: 'Hardhat'
        },
      ],
    }
]

const frameLang = [
    {
        frame: "Foundry",
        language: "Solidity"
    },
    {
        frame: "Hardhat",
        language: "javascript"  
    }
]

export default function CodingSpecial(props) {
    
    const { onChange, deleteCase, defaultValue, checkCode, className } = props;
    const editorRef = useRef(null);
    let [logs, setLogs] = useState([]);
    let [loading, setLoading] = useState();

    async function Test(params) {
        setLoading(true);
        const arr = await checkCode();
        logs.push(...arr);
        setLogs([...logs]);
        setLoading(false);
    }

    useUpdateEffect(() => {
        let container = document.querySelector('.coding-special .log-content');
        container.scrollTop = container.scrollHeight;
    },[logs])

    return (
        <div className={`coding-special ${className}`}>
            <div className="flex">
                <div className="case-close" onClick={deleteCase}>
                    <CustomIcon type="icon-close" />
                </div>
                <div className="form">
                        <div className="label">
                            代码编辑器
                        </div>
                        <Select
                            style={{
                                width: "200px",
                                marginTop: "10px"
                            }}
                            className="select-frame"
                            getPopupContainer={() => document.querySelector(`.${className}`)}
                            placeholder="框架"
                            onChange={(frame => {
                                // 切换编辑器语种
                                editorRef.current
                                .changeLang(frameLang.find(e => e.frame === frame)?.language)
                                // 返回值
                                onChange(frame, "frame")
                            })}
                            options={frame}
                            defaultValue={defaultValue.spj_code.frame}
                        />
                        <MonacoEditor
                            value={defaultValue.spj_code.code}
                            onChange={(newValue) => {
                                onChange(newValue, "code")
                            }}
                            ref={editorRef}
                            language={defaultValue ? frameLang.find(e => e.frame === defaultValue.spj_code.frame)?.language : ""}
                        />
                </div>
                <Button 
                    className="test-btn"
                    onClick={Test}
                    disabled={!defaultValue.spj_code.frame}
                    loading={loading}
                >
                    <CaretRightOutlined />执行测试用例
                </Button>
            </div>
            {
                logs.length > 0 &&
                <div className="log">
                    <p className="log-label">
                        代码执行结果
                    </p>
                    <ul className="log-content custom-scroll">
                        {
                            logs.map((e,i) => 
                                <li key={i}>
                                    {e}
                                </li>
                            )
                        }
                    </ul>
                </div>
            }
        </div>
    )
}