import { Select } from "antd";
import { useTranslation } from "react-i18next";


export default function FormDiff(params) {
    
    const { t } = useTranslation(["translation"]);

    return (
        <Select
            options={[
                {value:0,label: t("diff-info.easy")},
                {value:1,label: t("diff-info.normal")},
                {value:2,label: t("diff-info.diff")}
            ]}
        />
    )
}