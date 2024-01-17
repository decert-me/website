import { Spin } from "antd";
import { LoadingOutlined } from '@ant-design/icons';


export default function CustomLoad(props) {
    const { fs, color, ml } = props;
    return (
        <Spin
            indicator={
            <LoadingOutlined
                style={{
                    fontSize: fs || 24,
                    color: color || "#8F5A35",
                    marginLeft: ml || "15px"
                }}
                spin
            />
            }
        />
    )
}