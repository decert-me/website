import { Button, Form, Input, InputNumber, message, Modal } from "antd";
import { useState } from "react";
import { filterType } from "../../utils/filter";
import CustomAddAnswer from "../CustomItem/CustomAddAnswer";
import CustomEditor from "../CustomItem/CustomEditor";


export default function ModalAddQuestion(props) {
    
    const { isModalOpen, handleCancel, questionChange } = props;

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
            message.warning("Please input title")
            return
        }

        let optionArr = [];
        const { type, ans } = filterType(values);
        if (ans.length === 0) {
            message.warning("至少选择一个正确答案")
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
            <h5>*题目</h5>
            <CustomEditor changeTitle={changeTitle} />

            <Form
                layout="vertical"
                onFinish={onFinish}
            >
                <CustomAddAnswer />

                <Form.Item
                    label="题目分数"
                    name="score"
                    rules={[
                        {
                          required: true,
                          message: "Please input score",
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
                    <Button type="primary" htmlType="submit">添加</Button>
                </Form.Item>
            </Form>
        </Modal>
    )
}