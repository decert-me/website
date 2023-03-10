import { message } from "antd";
import i18n from 'i18next';

const json = {
    'en-US': require("@/assets/locales/en-US/public.json"),
    'zh-CN': require("@/assets/locales/zh-CN/public.json")
}

export const ClaimShareSuccess = () => {
    const obj = json[i18n.language].message.success.submit;
    return (
        message.info({
            content: (
                <div>
                    <h4>{obj.title}</h4>
                    <p>{obj.desc}</p>
                </div>
            ),
            duration: 3,
            icon: <></>,
            className: "message-share"
        })
    )
}

export const ClaimShareError = () => {
    const obj = json[i18n.language].message.error.submit;
    return (
        message.info({
            content: (
                <div>
                    <h4>{obj.title}</h4>
                    <p>{obj.desc}</p>
                </div>
            ),
            duration: 3,
            icon: <></>,
            className: "message-share"
        })
    )
}