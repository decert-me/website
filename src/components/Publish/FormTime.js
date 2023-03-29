import { Select } from "antd";
import { useTranslation } from "react-i18next";


export default function FormTime(params) {
    
    const { t } = useTranslation(["translation"]);

    return (
        <Select
            options={[
                {value: 600,label: t("time-info.m", {time: "10"})},
                {value: 1800,label: t("time-info.m", {time: "30"})},
                {value: 3600,label: t("time-info.h", {time: "1"})},
                {value: 7200,label: t("time-info.h", {time: "2"})},
                {value: 14400,label: t("time-info.h", {time: "4"})},
                {value: 86400,label: t("time-info.d", {time: "1"})},
                {value: 259200,label: t("time-info.d", {time: "3"})},
                {value: 604800,label: t("time-info.w", {time: "1"})}
            ]}
        />
    )
}