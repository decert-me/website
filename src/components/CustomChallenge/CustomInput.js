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
                    className={`custom-input`} 
                    bordered={false} 
                    onChange={e => value(e.target.value, "fill_blank")}  
                    defaultValue={defaultValue?.value}
                    autoSize={{
                        minRows: 7,
                    }}
                />
                {
                    isPreview && (
                        <p className="correct-content">
                            <span className="preivew-correct">{t("correct")}:</span> 
                            {answer}
                        </p>
                    )
                }
            </div>
        </div>
    )
}