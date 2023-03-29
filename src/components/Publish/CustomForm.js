import { Button, Divider, Empty, Form, Input, InputNumber } from "antd";
import { useTranslation } from "react-i18next";
import { ConfirmClearQuest } from "../CustomConfirm/ConfirmClearQuest";
import { CustomQuestion, CustomEditor } from "@/components/CustomItem";
import { FormTime, FormDiff, FormUpload } from "@/components/Publish";

const { TextArea } = Input;


export default function CustomForm(props) {

    const { 
        onFinish, 
        onFinishFailed, 
        deleteQuestion, 
        writeLoading, 
        showAddModal,
        fields,
        questions,
        isClick,
        sumScore,
        waitLoading,
        recommend,
        preview,
        clearQuest
    } = props;
    const { t } = useTranslation(["publish", "translation"]);
    const [form] = Form.useForm();
    
    const checkPreview = async() => {
        let flag;
        await form.validateFields()
        .then(() => {
            flag = true;
        })
        .catch(() => {
            flag = false;
        })
        preview(form.getFieldsValue(), flag)
    }

    return (
        <Form
            className="inner"
            name="challenge"
            layout="vertical"
            form={form}
            labelCol={{
                span: 5,
            }}
            initialValues={{
                remember: true,
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            fields={fields}
        >
            <Form.Item
                label={t("inner.title")}
                name="title"
                rules={[{
                    required: true,
                    message: t("inner.rule.title"),
                }]}
            >
                <Input />
            </Form.Item>

            <Form.Item 
                label={t("inner.desc")}
                name="desc"
            >
                <TextArea 
                    maxLength={300} 
                    showCount
                    autoSize={{
                        minRows: 3,
                        maxRows: 5,
                    }}
                  />
            </Form.Item>

            <Form.Item 
                label={
                    <>
                        {t("inner.recommend")}
                        <span className="tip">*{t("inner.rule.recommend")}</span>
                    </>
                }
                name="editor"
                className="Editor-hide"
            >
                <CustomEditor initialValues={recommend} />
            </Form.Item>
            
            <Form.Item 
                label={t("inner.img")}
                name="fileList"
                valuePropName="img"
                rules={[{
                    required: true,
                    message: t("inner.rule.img"),
                }]}
                wrapperCol={{
                    offset: 1,
                }}
                style={{
                    maxWidth: 380,
                }}
            >
                <FormUpload />
            </Form.Item>

            <Divider />
            
            {/* question list */}
            <div className="questions">
                <div className="quest-head">
                    <div className="left">
                        <span>*</span> {t("inner.test")} 
                    </div>
                    {
                        questions.length !== 0 &&
                        <Button 
                            type="link" 
                            onClick={() => ConfirmClearQuest(clearQuest)}
                        >
                            {t("inner.clear")} 
                        </Button>
                    }
                </div>
                {
                    questions.length !== 0 ?
                    <Divider />
                    :
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={"no data"} />
                }
                {
                    questions.map((e,i) => 
                        <CustomQuestion
                            key={i} 
                            item={e} 
                            index={i+1} 
                            deleteQuestion={deleteQuestion} 
                        />
                    )
                }
            </div>

            {/* add multiple */}
            <div className="add-btns">
                <Button
                    type="link" 
                    onClick={() => showAddModal()}
                    danger={questions.length === 0 && isClick}
                >
                    {t("inner.add")}
                </Button>
            </div>
            <Divider />

            <div className="challenge-info">
                <Form.Item 
                    label={t("inner.score")}
                    name="score"
                    rules={[{
                        required: true,
                        message: t("inner.rule.score"),
                    }]}
                >
                    <InputNumber
                        min={1} 
                        max={sumScore === 0 ? 1 : sumScore}
                        controls={false}
                        precision={0}
                        style={{
                            width: "150px"
                        }}
                    />
                </Form.Item>

                <div className="form-item">
                    <p className="title">{t("inner.total")}</p>
                    <InputNumber 
                        value={sumScore} 
                        disabled
                        style={{
                            width: "150px"
                        }}
                    />
                </div>

                <Form.Item 
                    label={t("translation:diff")}
                    name="difficulty"
                >
                    <FormDiff />
                </Form.Item>

                <Form.Item 
                    label={t("translation:time")}
                    name="time"
                >
                    <FormTime />
                </Form.Item>
            </div>


            <div className="Publish-btns">
                <div className="btns">
                    <div className="left">
                    </div>
                    <div className="right">
                        <Button 
                            type="primary" 
                            ghost 
                            disabled={
                                questions.length === 0
                            }
                            onClick={() => checkPreview()}
                        >
                            {t("translation:btn-view")}
                        </Button>
                        <Form.Item
                            style={{
                                margin: 0
                            }}
                        >
                            <Button 
                                className="submit"
                                type="primary" 
                                htmlType="submit" 
                                loading={ writeLoading || waitLoading }
                            >
                                {t("translation:btn-publish")}
                            </Button>
                        </Form.Item>
                    </div>
                </div>
            </div>
        </Form>
    )
}