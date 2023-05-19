import { Button, Form, InputNumber, message, Modal } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { filterType } from "../../utils/filter";
import CustomAddAnswer from "../CustomItem/CustomAddAnswer";
import CustomEditor from "../CustomItem/CustomEditor";


export default function ModalEditQuestion(props) {
    
    const { isModalOpen, handleCancel, questionChange, selectIndex, selectQs } = props;
    const { t } = useTranslation(['publish', 'translation']);
    let [questionTitle, setQuestionTitle] = useState('');
    let [questInfo,setQuestInfo] = useState({});
    let [fields, setFields] = useState();

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
            score: values.score,
            type: type,
            answers: ans
        }
        setQuestInfo({...questInfo})
        questionChange(questInfo)
        setQuestionTitle('')
        handleCancel()
    }

    const getAnswer = (i) => {
        let option = null;
        switch (selectQs.type) {
            case "multiple_choice":
                // 单选
                option = selectQs.answers === i ? 2 : 1;
                break;
            case "multiple_response": 
                // 多选
                option = selectQs.answers.includes(i) ? 2 : 1;
            default:
                // 填空
                break;
        }
        return option
    }

    useEffect(() => {
        if (selectQs) {
            let arr = [];
            if (selectQs.options) {                
                selectQs.options.map((e,i) => {
                    arr.push({
                        "key": i,
                        "name": i,
                        "isListField": true,
                        "fieldKey": i,
                        "title": e,
                        "options": getAnswer(i)
                    })
                })
                fields = arr;
                setFields([...fields]);
            }
        }
    },[selectQs])

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
            <h5>*{t("inner.ques")} #{selectIndex + 1}</h5>
            <CustomEditor changeTitle={changeTitle} initialValues={selectQs?.title} />

            <Form
                layout="vertical"
                onFinish={onFinish}
                fields={[
                    {
                        name: ["score"],
                        value: selectQs?.score
                    }
                ]}
            >
                <CustomAddAnswer fields={fields} />

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
                    <Button type="primary" htmlType="submit">{t("translation:btn-save")}</Button>
                </Form.Item>
            </Form>
        </Modal>
    )
}