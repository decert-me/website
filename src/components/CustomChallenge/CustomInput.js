import { Input } from "antd";
import CustomViewer from "../CustomViewer";

export default function CustomInput(props) {
    
    const { label, value, defaultValue } = props;

    return (
        <div className="CustomInput">
            <div className="inner-title">
                <CustomViewer label={label} />
            </div>
            <Input 
                className="custom-input" 
                bordered={false} 
                onChange={e => value(e.target.value, "fill_blank")}  
                defaultValue={defaultValue}
            />
        </div>
    )
}