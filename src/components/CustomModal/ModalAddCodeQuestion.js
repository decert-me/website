import { useEffect, useRef, useState } from "react";
import { Encryption } from "@/utils/Encryption";
import { Modal, Input, Space, Button, Form, Checkbox, Radio, InputNumber, message } from "antd";
import { useTranslation } from "react-i18next";
import { CustomEditor } from "@/components/CustomItem";
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import MonacoEditor from "@/components/MonacoEditor";
import "@/assets/styles/component-style/modal-coding.scss"
import { codeTest } from "@/request/api/quests";
import CustomCase from "../Publish/CustomCase";

export default function ModalAddCodeQuestion(props) {

    const { isModalOpen, handleCancel, questionChange, selectQs, questionEdit } = props;
    const { t } = useTranslation(['publish', 'translation']);
    const { encode, decode } = Encryption();
    const [form] = Form.useForm();
    const key = process.env.REACT_APP_ANSWERS_KEY;
    const caseRef = useRef(null);
    let [languages, setLanguages] = useState([
        {
            label: 'Solidity',
            checked: true,
            value: 'Solidity',
            code: "",
            correctAnswer: ""
        }
    ]);
    const [isLoading, setIsLoading] = useState();

    function changeChecked(index, checked) {
        //  切换代码片段状态
        languages[index].checked = checked;
        setLanguages([...languages]);
    }

    function changeCoding(key, value, index) {
        // 修改代码片段
        languages[index][key] = value;
        setLanguages([...languages]);
    }

    function getValuesByKey(cases, key) {
        return cases
          .filter(obj => obj.hasOwnProperty(key))
          .map(obj => obj[key]);
    }
      

    const onFinish = (values) => {
        const rest = values;
        const cases = caseRef.current.caseArr;
        const inputArr = getValuesByKey(cases, 'input');
        const outputArr = getValuesByKey(cases, 'output');
        const spj_code = getValuesByKey(cases, 'spj_code');

        const codeSnippetArr = languages
        .filter(e => e.checked)
        .map(e => ({
            lang: e.value,
            code: e.code,
            correctAnswer: encode(key, JSON.stringify(e.correctAnswer))
        }));
        const obj = {
            ...rest,
            languages: codeSnippetArr.map(c => c.lang),
            code_snippets: codeSnippetArr,
            type: "coding",
            input: inputArr, 
            output: outputArr, 
            spj_code: spj_code
        };
        console.log(obj);
        return
        // 返回
        if (selectQs) {
            // 修改
            questionEdit(obj)
        }else{
            // 添加
            questionChange(obj);
        }
        onCancel();
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    function onCancel(params) {
        handleCancel()
    }

    function cacheInit(params) {
        // form表单初始化
        const { 
            code_snippets: code_snippets, 
            input: input, 
            output: output,
            ...common 
        } = selectQs;
        const cases = input && code_snippets.map((e,i) => {
            let arr = [];
            input.map((ele,index) => {
                arr.push({
                    input: input[index],
                    output: output[index]
                })
            })
            return arr
        })
        const obj = {
            ...common,
            case: cases
        }
        const arr = [];
        Object.keys(obj).map((e) => {
            arr.push({
                name: e,
                value: e === "case" && obj[e] ? obj[e][0] : obj[e]
            })
        })
        form.setFields(arr);
        
        // 代码片段、描述 初始化
        languages.map(e => {
            const index = code_snippets.findIndex(item => item.lang === e.value)
            if (index !== -1) {
                e.checked = true;
                Object.keys(code_snippets[index]).map(ele => {
                    const value = code_snippets[index][ele];
                    e[ele] = ele === "correctAnswer" ? eval(decode(key, value)) : value;
                })
            }
            
        })
        setLanguages([...languages]);
    }

    useEffect(() => {
        // 修改模式
        selectQs && cacheInit();
    },[])

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
                    label="题目描述"
                    name="description"
                    rules={[
                        {
                        required: true,
                        message: '请填写描述!',
                        },
                    ]}
                >
                    <CustomEditor 
                        mode="tab" 
                        onChange={
                            (e) => form.setFieldValue("description",e)
                        } 
                        initialValues={selectQs?.description}
                    />
                </Form.Item>

                {/* 代码片段 */}
                <Form.Item
                    label="代码"
                >
                    {
                        languages.map((e, i) => 
                            <div
                                key={i}
                            >
                                <Checkbox 
                                    checked={e.checked} 
                                    disabled
                                    onChange={
                                        (e) => changeChecked(i, e.target.checked)
                                    } 
                                >
                                    {e.label}
                                </Checkbox>
                                {
                                    e.checked &&
                                    <div className="border-b">
                                        <div className="code-snippets">
                                            <div className="label">代码模板<span>由挑战者去补充完整</span></div>
                                            <MonacoEditor
                                                value={e.code}
                                                onChange={(newValue) => {
                                                    changeCoding("code", newValue, i);
                                                }}
                                                language={e.label}
                                            />
                                        </div>
                                        <div className="code-snippets">
                                            <div className="label">代码示例<span>正确的代码</span></div>
                                            <MonacoEditor
                                                value={e.correctAnswer}
                                                onChange={(newValue) => {
                                                    changeCoding("correctAnswer", newValue, i);
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

                {/* 测试用例 */}
                {/* <Form.Item 
                        label="测试用例"
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
                </Form.Item> */}

                {/* 特殊题测试用例 */}
                {/* <Form.Item
                        label="特殊题测试用例"
                        name="spj_code"
                    >
                        <div className="code-snippets">
                            <MonacoEditor
                                value={selectQs?.spj_code}
                                onChange={(e) => form.setFieldValue("spj_code",e)}
                                language={"Solidity"}
                            />
                        </div>
                </Form.Item> */}
                <Form.Item
                    label="测试用例"
                >
                    <CustomCase ref={caseRef} />
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
                        添加
                    </Button>
                </Form.Item>
            </Form>
    </Modal>
    )
}
