import { Button, Form, Input, Radio } from "antd";
import {
    CaretRightOutlined,
} from '@ant-design/icons';
import { useState } from "react";
import CustomIcon from "../CustomIcon";
import { useUpdateEffect } from "ahooks";

export default function Coding(props) {

    const { onChange, deleteCase, defaultValue, checkCode } = props;
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
        let container = document.querySelector('.coding .log-content');
        container.scrollTop = container.scrollHeight;
    },[logs])

    return (
        <div className="coding">
                <div className="case-close" onClick={deleteCase}>
                    <CustomIcon type="icon-close" />
                </div>
                <div className="form">
                    <div className="box">
                        <p className="box-label">输入</p>
                        <Input onChange={(e) => onChange(e.target.value, "input")} defaultValue={defaultValue.input} />
                    </div>
                    <div className="box">
                        <p className="box-label">输入</p>
                        <Input onChange={(e) => onChange(e.target.value, "output")} defaultValue={defaultValue.output} />
                    </div>
                    <Button 
                        className="test-btn"
                        onClick={Test}
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