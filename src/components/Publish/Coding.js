import { Button, Form, Input, Radio } from "antd";
import {
    CaretRightOutlined
} from '@ant-design/icons';
import { useState } from "react";

export default function Coding(params) {


    return (
        <div className="coding">
            <div className="form">
                <div className="box">
                    <p className="box-label">输入</p>
                    <Input />
                </div>
                <div className="box">
                    <p className="box-label">输入</p>
                    <Input />
                </div>
                <Button className="test-btn"><CaretRightOutlined />执行测试用例</Button>
            </div>
        </div>
    )
}