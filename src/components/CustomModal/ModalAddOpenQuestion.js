import { Button, Divider, Form, Input, InputNumber, message, Modal } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { filterType } from "../../utils/filter";
import CustomEditor from "../CustomItem/CustomEditor";


export default function ModalAddOpenQuestion(props) {
    
    const { isModalOpen, handleCancel, questionChange, selectQs, questionEdit } = props;
    const { t } = useTranslation(['publish', 'translation']);
    const [form] = Form.useForm();
    let [questionTitle, setQuestionTitle] = useState('');
    let [score, setScore] = useState();
    let [questInfo,setQuestInfo] = useState({});
    let [fields, setFields] = useState();     //  表单默认值
    

    const changeTitle = (e) => {
        questionTitle = e;
        setQuestionTitle(questionTitle);
    }

    const onCancel = () => {
        setQuestionTitle('')
        handleCancel()
    }

    const onFinish = ({score}) => {
        if (!questionTitle) {
            message.warning(t("inner.rule.title"))
            return
        }
        questInfo = {
            ...questInfo,
            title: questionTitle,
            options: null,
            score: score,
            type: "open_quest",
            answers: null
        }
        setQuestInfo({...questInfo})
        if (selectQs) {
            questionEdit(questInfo)
        }else{
            questionChange(questInfo)
        }
        setQuestionTitle('')
        handleCancel()
    }

    function init() {            
        if (selectQs) {
            form.setFieldValue("score", selectQs.score);
        }
    }

    useEffect(() => {
        init();
    },[])

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
            <CustomEditor changeTitle={changeTitle} initialValues={selectQs?.title || ""} />

            <Form
                layout="vertical"
                onFinish={onFinish}
                form={form}
            >
                <Divider style={{
                    marginBottom: 0,
                    marginTop: "30px"
                }} />
                <Form.Item
                    label={t("inner.sc")}
                    name="score"
                    rules={[
                        {
                          required: true,
                          message: t("inner.rule.ques-score"),
                        }
                    ]}
                >
                    <InputNumber 
                        min={1} 
                        controls={false}
                        precision={0}
                    />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">{
                        selectQs ? t("translation:btn-save") : t("translation:btn-add")
                    }</Button>
                </Form.Item>
            </Form>
        </Modal>
    )
}