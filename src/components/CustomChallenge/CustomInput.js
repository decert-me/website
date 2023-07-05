import { Input } from "antd";
import CustomViewer from "../CustomViewer";
import { useTranslation } from "react-i18next";
const { TextArea } = Input;
export default function CustomInput(props) {
    
    const { label, value, defaultValue, isPreview, answer } = props;
    const { t } = useTranslation(["explore"]);

    return (
        <div className="CustomInput">
            <div className="inner-title">
                <CustomViewer label={label} />
            </div>
            <div className="CustomInput-content">
                <TextArea 
                    className={`custom-input ${isPreview ? "custom-input-preview" : ""}`} 
                    bordered={false} 
                    onChange={e => value(e.target.value, "fill_blank")}  
                    defaultValue={isPreview ? answer : defaultValue?.value}
                    autoSize={{
                        minRows: 7,
                    }}
                />
                {
                    isPreview && <p className="preivew-correct">{t("correct")}:</p>
                }
            </div>
        </div>
    )
}