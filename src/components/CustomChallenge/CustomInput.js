import { Viewer } from "@bytemd/react";
import { Input } from "antd";

export default function CustomInput(props) {
    
    const { label, value, defaultValue, plugins } = props;

    return (
        <div className="CustomInput">
            <div className="inner-title">
                <Viewer value={label} plugins={plugins} />
            </div>
            <Input 
                className="custom-input" 
                bordered={false} 
                onChange={e => value(e.target.value)}  
                defaultValue={defaultValue}
            />
        </div>
    )
}