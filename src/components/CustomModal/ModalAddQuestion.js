import { Button, Form, Input, InputNumber, message, Modal } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { filterType } from "../../utils/filter";
import CustomAddAnswer from "../CustomItem/CustomAddAnswer";
import CustomEditor from "../CustomItem/CustomEditor";


export default function ModalAddQuestion(props) {
    
    const { isModalOpen, handleCancel, questionChange } = props;
    const { t } = useTranslation(['publish', 'translation']);
    let [questionTitle, setQuestionTitle] = useState('');
    let [score, setScore] = useState();
    let [questInfo,setQuestInfo] = useState({});
    

    const changeTitle = (e) => {
        questionTitle = e;
        setQuestionTitle(questionTitle);
    }

    const onCancel = () => {
        setQuestionTitle('')
        handleCancel()
    }

    const onFinish = (values) => {
        if (!questionTitle) {
            message.warning(t("inner.rule.title"))
            return
        }

        let optionArr = [];
        const { type, ans } = filterType(values);
        if (ans.length === 0) {
            message.warning(t("message.error.answer"))
            return
        }
        values.options.map((e)=>{
            optionArr.push(e.title)
        })
        questInfo = {
            ...questInfo,
            title: questionTitle,
            options: optionArr,
            score: score,
            type: type,
            answers: ans
        }
        setQuestInfo({...questInfo})
        questionChange(questInfo)
        setQuestionTitle('')
        handleCancel()
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
            <CustomEditor changeTitle={changeTitle} />

            <Form
                layout="vertical"
                onFinish={onFinish}
            >
                <CustomAddAnswer />

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
                        value={score} 
                        onChange={(e)=>setScore(e)} 
                        controls={false}
                        precision={0}
                    />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">{t("translation:btn-add")}</Button>
                </Form.Item>
            </Form>
        </Modal>
    )
}