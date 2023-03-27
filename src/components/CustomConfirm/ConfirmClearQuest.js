import { Button, Modal } from 'antd';
import i18n from 'i18next';
import "@/assets/styles/component-style/confirm/clear-quest.scss"
const { confirm } = Modal;

const json = {
    'en-US': require("@/assets/locales/en-US/public.json"),
    'zh-CN': require("@/assets/locales/zh-CN/public.json")
}


export const ConfirmClearQuest = (clearLocal) => {
    const obj = json[i18n.language].message.success.submit;

    return (
        confirm({
            title: '',
            icon: <></>,
            width: "527px",
            className: "ConfirmClearQuest",
            content: (
                <p>清空所有内容？</p>
            ),
            okText: '确认',
            okButtonProps: (() => {
                return <Button type="primary"></Button>
            }),
            cancelText: '取消',
            cancelButtonProps: (() => {
                return <Button type="primary" ghost></Button>
            }),
            onOk() {
              clearLocal();
            }
          })
    )
};