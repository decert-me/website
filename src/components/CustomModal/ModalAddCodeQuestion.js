import { Encryption } from "@/utils/Encryption";
import { Modal, Input, Space, Button } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
const { TextArea } = Input;

export default function ModalAddCodeQuestion(props) {

    const { isModalOpen, handleCancel, questionChange } = props;
    const { t } = useTranslation(['publish', 'translation']);
    let [question, setQuestion] = useState();
    const { encode } = Encryption();

    function onCancel(params) {
        setQuestion(null)
        handleCancel()
    }

    function pushQuest(value) {
        question = value;
        setQuestion(question)
    }

    function onFinish(params) {
        // 答案加密
        let obj = JSON.parse(question);
        obj.code_snippets.map(e => {
            e.correctAnswer = encode(process.env.REACT_APP_ANSWERS_KEY, JSON.stringify(e.correctAnswer))
        })
        questionChange(obj);
    }

    return (
        <Modal
            className="ModalAddQuestion" 
            open={isModalOpen}
            onCancel={onCancel}
            footer={null}
            width={1100}
            centered
            maskClosable={false}
            destroyOnClose={true}
        >
        <h5>*{t("inner.test")}</h5>
        <Space direction="vertical" style={{width: "100%"}}>
            <TextArea
                onChange={(e) => pushQuest(e.target.value)}
                // placeholder="Controlled autosize"
                autoSize={{
                minRows: 3,
                }}
            />
            <Button onClick={onFinish}>{t("translation:btn-add")}</Button>
        </Space>
    </Modal>
    )
}