import { Button } from "antd";
import {
    CaretRightOutlined
} from '@ant-design/icons';
import MonacoEditor from "../MonacoEditor";
import CustomIcon from "../CustomIcon";

export default function CodingSpecial(props) {
    
    const { onChange, deleteCase } = props;

    return (
        <div className="coding-special">
            <div className="case-close" onClick={deleteCase}>
                <CustomIcon type="icon-close" />
            </div>
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