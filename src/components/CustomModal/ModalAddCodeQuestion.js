import { useEffect, useRef, useState } from "react";
import {
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { Encryption } from "@/utils/Encryption";
import { Modal, Input, Space, Button, Form, Checkbox, Radio, InputNumber, message, Spin } from "antd";
import { useTranslation } from "react-i18next";
import { CustomEditor } from "@/components/CustomItem";
import MonacoEditor from "@/components/MonacoEditor";
import "@/assets/styles/component-style/modal-coding.scss"
import { codeTest } from "@/request/api/quests";
import CustomCase from "../Publish/CustomCase";
import { ANSI } from "@/utils/convert";
import { exampleAction } from "@/utils/exampleAction";

export default function ModalAddCodeQuestion(props) {

    const { isModalOpen, handleCancel, questionChange, selectQs, questionEdit } = props;
    const { t } = useTranslation(['publish', 'translation']);
    const { encode, decode } = Encryption();
    const [form] = Form.useForm();
    const key = process.env.REACT_APP_ANSWERS_KEY;
    const caseRef = useRef(null);
    const [modal, contextHolder] = Modal.useModal();
    const [loading, setLoading] = useState(false);
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


    async function checkCode(code) {
        const obj = languages.filter(e => e.checked)[0];
        let codeObj = {
            code: "", //写入的代码
            example_code: obj.correctAnswer, //代码示例
            code_snippet: obj.code, //代码片段
            lang: obj.value,
            ...code
        }
        const logs = ["开始编译..."];

        // 用例检测
        await codeTest(codeObj)
        .then(res => {
            if (res?.data) {
                const msg = res.data.msg && ANSI(res.data.msg);
                switch (res.data.status) {
                    case 1:
                        logs.push(...["❌编译失败", msg]);
                        break;
                    case 2:
                        logs.push(...["✅编译成功","❌运行失败", msg]);
                        break;
                    case 3:
                        logs.push(...["✅编译成功","✅运行成功",res.data.correct ? "✅测试用例通过" : "❌测试用例未通过", msg]);
                        break;
                    default:
                        break;
                }
            }else{
                logs.push(...["❌编译失败"]);
            }
        })
        return logs
        
    }

    const onFinish = async(values) => {
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
        let flag = true;
        const testObj = {
            code: "", //写入的代码
            example_code: JSON.parse(decode(key, obj.code_snippets[0].correctAnswer)), //代码示例
            code_snippet: obj.code_snippets[0].code, //代码片段
            lang: obj.languages[0],
            input: [],
            example_input: obj.input,
            example_output: obj.output,
            spj_code: obj.spj_code
        }
        setLoading(true);
        await codeTest(testObj)
        .then(res => {
            if (res.status === 7 || 
                res.data.status === 1 ||
                res.data.status === 2 ||
                res.data.correct === false
                ) {
                // 弹出用例有误
                flag = false
                modal.confirm({
                    title: '',
                    icon: <></>,
                    className: "custom-confirm",
                    cancelText: "取消",
                    okText: "好的",
                    content: (
                        <p>测试用例有误，请修改后重新保存</p>
                    )
                })
            }
        })
        setLoading(false);
        if (!flag) {
            return
        }
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
            spj_code: spj_code,
            ...common 
        } = selectQs;

        // 用例初始化
        const coding = input.map((ele,index) => {
            return {
                input: input[index],
                output: output[index]
            }
        })
        const spj = spj_code.map(e => {
            return {
                spj_code: {
                    frame: e.frame,
                    code: e.code
                }
            }
        })
        caseRef.current.setCaseArr([...coding, ...spj])

        //  表单初始化
        const arr = [];
        Object.keys(common).map((e) => {
            arr.push({
                name: e,
                value: common[e]
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
            <Spin spinning={loading} size="large">
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
                {contextHolder}
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
                                                <div className="label">代码模板
                                                    <ExclamationCircleOutlined 
                                                        className="icon-sigh s1" 
                                                        onMouseEnter={() => exampleAction(".show3", "block", ".s1", "tr")}
                                                        onMouseLeave={() => exampleAction(".show3", "none", ".s1", "tr")}
                                                    />
                                                    <span>由挑战者去补充完整</span>
                                                </div>
                                                <MonacoEditor
                                                    value={e.code}
                                                    onChange={(newValue) => {
                                                        changeCoding("code", newValue, i);
                                                    }}
                                                    language={e.label}
                                                />
                                            </div>
                                            <div className="code-snippets">
                                                <div className="label">代码示例
                                                    <ExclamationCircleOutlined 
                                                        className="icon-sigh s2" 
                                                        onMouseEnter={() => exampleAction(".show4", "block", ".s2", "tr")}
                                                        onMouseLeave={() => exampleAction(".show4", "none", ".s2", "tr")}
                                                    />
                                                    <span>正确的代码</span>
                                                </div>
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
                    <Form.Item
                        label="测试用例"
                    >
                        <CustomCase ref={caseRef} checkCode={checkCode} />
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
            </Spin>
            <div className="poa  show3">
                <img src={require("@/assets/images/img/publish-example3.png")} alt="" />
            </div>
            <div className="poa  show4">
                <img src={require("@/assets/images/img/publish-example4.png")} alt="" />
            </div>
    </Modal>
    )
}
