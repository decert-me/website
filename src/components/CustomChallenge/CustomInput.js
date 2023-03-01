import { Input } from "antd";

export default function CustomInput(props) {
    
    const { label, value, defaultValue } = props;

    return (
        <div className="CustomInput">
            <p className="inner-title">{label}</p>
            <Input 
                className="custom-input" 
                bordered={false} 
                onChange={e => value(e.target.value)}  
                defaultValue={defaultValue}
            />
        </div>
    )
}