import { Button } from "antd";
import {
    CaretRightOutlined
} from '@ant-design/icons';
import MonacoEditor from "../MonacoEditor";

export default function CodingSpecial(props) {
    
    const { onChange } = props;

    return (
        <div className="coding-special">
            <div className="form">
                <div className="label">代码编辑器</div>
                <MonacoEditor
                    value={""}
                    onChange={(newValue) => {
                        onChange(newValue)
                    }}
                    language={"Solidity"}
                />
            </div>
            <Button className="test-btn"><CaretRightOutlined />执行测试用例</Button>
        </div>
    )
}