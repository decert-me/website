import { Button, Form, Input, Radio } from "antd";
import {
    CaretRightOutlined,
} from '@ant-design/icons';
import { useState } from "react";
import CustomIcon from "../CustomIcon";

export default function Coding(props) {

    const { onChange, deleteCase, defaultValue } = props;

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
                <Button className="test-btn"><CaretRightOutlined />执行测试用例</Button>
            </div>
        </div>
    )
}