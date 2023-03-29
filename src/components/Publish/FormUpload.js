import { UploadProps } from "@/utils/UploadProps";
import { useTranslation } from "react-i18next";
import { InboxOutlined } from '@ant-design/icons';
import { Upload } from "antd";
const { Dragger } = Upload;


export default function FormUpload(params) {
    
    const { t } = useTranslation(["publish"]);

    return(
        <Dragger
            {...UploadProps} 
            listType="picture-card"
        >
            <p className="ant-upload-drag-icon" style={{ color: "#a0aec0" }}>
                <InboxOutlined />
            </p>
            <p className="ant-upload-text " style={{ color: "#a0aec0" }}>
                {t("inner.content.img.p1")}
            </p>
            <p className="ant-upload-hint " style={{ color: "#a0aec0" }}>
                {t("inner.content.img.p2")}
                <span style={{ color: "#f14e4e", fontSize: "20px" }}>*</span>
            </p>
        </Dragger>
    )
}