import { Spin } from "antd";

export default function PageLoader() {
    
    return (
        <div 
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignContent: "center",
                justifyContent: "center"
            }}
        >
            <Spin size="large" />
        </div>
    )
}