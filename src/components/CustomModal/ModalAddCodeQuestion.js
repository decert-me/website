import { useState } from "react";
import { Encryption } from "@/utils/Encryption";
import { Modal, Input, Space, Button, Form, Checkbox, Radio, InputNumber } from "antd";
import { useTranslation } from "react-i18next";
import { CustomEditor } from "@/components/CustomItem";
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import MonacoEditor from "@/components/MonacoEditor";
import "@/assets/styles/component-style/modal-coding.scss"

const { TextArea } = Input;
const questType = [
    {
        label: "编程题",
        value: "coding"
    },
    {
        label: "特殊编程题",
        value: "special_judge_coding"
    }
]

export default function ModalAddCodeQuestion(props) {

    const { isModalOpen, handleCancel, questionChange } = props;
    const { t } = useTranslation(['publish', 'translation']);
    const { encode } = Encryption();
    const [form] = Form.useForm();
    const selectType = Form.useWatch('type', form);
    let [languages, setLanguages] = useState([
        {
            label: 'Solidity',
            checked: false,
            value: 'Solidity',
            code: "",
            correctAnswer: ""
        },
        {
            label: 'JavaScript',
            checked: false,
            value: 'JavaScript',
            code: "",
            correctAnswer: ""
        }
    ]);
    const [spjLanguage, setSpjLanguage] = useState(languages[0].value);
    let [question, setQuestion] = useState();

    function changeChecked(index, checked) {
        //  切换代码片段状态
        languages[index].checked = checked;
        setLanguages([...languages]);
    }

    function changeCoding(key, value) {
        // 修改代码片段
    }

    function onValuesChange({ type }) {
        // form表单更改时拦截
        // console.log(form);
    }

    const onFinish = (values) => {
        console.log('Success:', values);
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    function onCancel(params) {
        setQuestion(null)
        handleCancel()
    }

    // function pushQuest(value) {
    //     question = value;
    //     setQuestion(question)
    // }

    // function onFinish(params) {
    //     // 答案加密
    //     let obj = JSON.parse(question);
    //     obj.code_snippets.map(e => {
    //         e.correctAnswer = encode(process.env.REACT_APP_ANSWERS_KEY, JSON.stringify(e.correctAnswer))
    //     })
    //     questionChange(obj);
    // }

    return (
        <Modal
            title="添加编程题"
            className="ModalAddQuestion" 
            open={isModalOpen}
            onCancel={onCancel}
            footer={null}
            width={1100}
            centered
            maskClosable={false}
            destroyOnClose={true}
        >
            <Form
                form={form}
                name="basic"
                initialValues={{
                    remember: true,
                    type: "coding"  //初始值
                }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                onValuesChange={onValuesChange}
                autoComplete="off"
                layout="vertical"
            >   
                {/* 题目 */}
                <Form.Item
                    label="题目"
                    name="title"
                    rules={[
                        {
                        required: true,
                        message: '请填写题目!',
                        },
                    ]}
                >
                    <Input />
                </Form.Item>

                {/* 描述 */}
                <Form.Item
                    label="描述"
                    name="description"
                    rules={[
                        {
                        required: true,
                        message: '请填写描述!',
                        },
                    ]}
                >
                    <CustomEditor mode="tab" onChange={(e) => form.setFieldValue("description",e)} />
                </Form.Item>

                {/* 测试用例 */}
                <Form.Item 
                    label="测试用例"
                    style={{display: selectType === "coding" ? "block" : "none"}}
                >
                    <Form.List 
                        name="case"
                    >
                        {(fields, { add, remove }) => (
                            <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Space
                                    key={key}
                                    style={{
                                        display: 'flex',
                                        marginBottom: 8,
                                    }}
                                    align="baseline"
                                >
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'input']}
                                        rules={[
                                        {
                                            required: true,
                                            message: '请输入`输入用例`',
                                        },
                                        ]}
                                    >
                                        <Input placeholder="输入用例" />
                                    </Form.Item>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'output']}
                                        rules={[
                                        {
                                            required: true,
                                            message: '请输入`输出用例`',
                                        },
                                        ]}
                                    >
                                        <Input placeholder="输出用例" />
                                    </Form.Item>
                                    <MinusCircleOutlined onClick={() => remove(name)} />
                                </Space>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    添加用例
                                </Button>
                            </Form.Item>
                            </>
                        )}
                    </Form.List>
                </Form.Item>

                {/* 代码片段 */}
                <Form.Item
                    label="代码片段"
                >
                    {
                        languages.map((e, i) => 
                            <div
                                key={i}
                            >
                                <Checkbox 
                                    checked={e.checked} 
                                    onChange={
                                        (e) => changeChecked(i, e.target.checked)
                                    } 
                                >
                                    {e.label}
                                </Checkbox>
                                {
                                    e.checked &&
                                    <div>
                                        <div className="code-snippets">
                                            <p>题目模板</p>
                                            <MonacoEditor
                                                value={e.code}
                                                onChange={(newValue) => {
                                                    changeCoding("code", newValue);
                                                }}
                                                language={e.label}
                                            />
                                        </div>
                                        <div className="code-snippets">
                                            <p>正确答案</p>
                                            <MonacoEditor
                                                value={e.correctAnswer}
                                                onChange={(newValue) => {
                                                    changeCoding("correctAnswer", newValue);
                                                }}
                                                language={e.label}
                                            />
                                        </div>
                                    </div>
                                }
                            </div>
                        )
                    }
                </Form.Item>

                {/* 题目类型 */}
                <Form.Item
                    label="题目类型"
                    name="type"
                >
                    <Radio.Group options={questType}/>
                </Form.Item>

                {/* 特殊题测试用例 */}
                <Form.Item
                    label="特殊题测试用例"
                    style={{display: selectType === "coding" ? "none" : "block"}}
                >
                    <Radio.Group options={languages} onChange={(e) => setSpjLanguage(e.target.value)} />
                    <div className="code-snippets">
                        <MonacoEditor
                            value=""
                            onChange={(newValue) => {
                                changeCoding("code", newValue);
                            }}
                            language={spjLanguage}
                        />
                    </div>
                </Form.Item>

                {/* 分数 */}
                <Form.Item
                    label="分数"
                    name="score"
                    rules={[
                        {
                        required: true,
                        message: '请输入当前题目分数!',
                        },
                    ]}
                >
                    <InputNumber
                        style={{
                            width: '100%',
                        }}
                    />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        submit
                    </Button>
                </Form.Item>
            </Form>
    </Modal>
    )
}
