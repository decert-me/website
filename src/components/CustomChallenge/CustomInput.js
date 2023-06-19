import { Input } from "antd";
import CustomViewer from "../CustomViewer";
const { TextArea } = Input;
export default function CustomInput(props) {
    
    const { label, value, defaultValue } = props;

    return (
        <div className="CustomInput">
            <div className="inner-title">
                <CustomViewer label={label} />
            </div>
            <TextArea 
                className="custom-input" 
                bordered={false} 
                onChange={e => value(e.target.value, "fill_blank")}  
                defaultValue={defaultValue?.value}
                autoSize={{
                    minRows: 7,
                }}
            />
        </div>
    )
}