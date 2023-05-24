import { Button, Select } from "antd";
import {
    CaretRightOutlined
} from '@ant-design/icons';
import MonacoEditor from "../MonacoEditor";
import CustomIcon from "../CustomIcon";

const frame = [
    {
      label: 'Solidity',
      options: [
        {
          label: 'Foundry',
          value: 'Foundry',
        },
        {
          label: 'Hardhat',
          value: 'Hardhat',
        },
      ],
    }
  ]

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
                        onChange(newValue, "code")
                    }}
                    language={"Solidity"}
                />
            </div>
            <div>
                <Button className="test-btn"><CaretRightOutlined />执行测试用例</Button>
                <Select
                    style={{
                        marginTop: "10px"
                    }}
                    placeholder="框架"
                    onChange={(frame => {
                        onChange(frame, "frame")
                    })}
                    options={frame}
                />
            </div>
        </div>
    )
}