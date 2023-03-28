import { UploadProps } from "@/utils/UploadProps";
import { Button, Divider, Form, Input, InputNumber, Select, Upload } from "antd";
import { InboxOutlined } from '@ant-design/icons';
import CustomQuestion from "../CustomItem/CustomQuestion";
import { ConfirmClearQuest } from "@/components/CustomConfirm/ConfirmClearQuest";
import { useTranslation } from "react-i18next";
import CustomEditor from "../CustomItem/CustomEditor";

const { Dragger } = Upload;
const { TextArea } = Input;


export default function CustomForm(props) {

    const { t } = useTranslation(["publish", "translation"]);

    const { 
        onFinish, 
        onFinishFailed, 
        deleteQuestion, 
        writeLoading, 
        clearLocal, 
        showAddModal,
        fields,
        questions,
        isClick,
        sumScore,
        waitLoading,
        recommend
    } = props;
    const [form] = Form.useForm();
    
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
                // label={t("inner.desc")}
                label="推荐学习内容"
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
                <Dragger 
                    {...UploadProps} 
                    listType="picture-card"
                >
                    <p className="ant-upload-drag-icon" style={{ color: "#a0aec0" }}>
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text " style={{ color: "#a0aec0" }}>
                        {t("inner.content.img.p1")}
                    </p>
                    <p className="ant-upload-hint " style={{ color: "#a0aec0" }}>
                        {t("inner.content.img.p2")}
                        <span style={{ color: "#f14e4e", fontSize: "20px" }}>*</span>
                    </p>
                </Dragger>
            </Form.Item>

            <Divider />
            
            {/* question list */}
            <div className="questions">
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
            <div className="btns">
                <Button
                    type="link" 
                    onClick={() => showAddModal()}
                    danger={questions.length === 0 && isClick}
                >
                    {t("inner.add")}
                </Button>
                {/* <Button type="link">
                    Add code question
                </Button> */}
            </div>

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
                    <Select
                        options={[
                            {value:0,label: t("translation:diff-info.easy")},
                            {value:1,label: t("translation:diff-info.normal")},
                            {value:2,label: t("translation:diff-info.diff")}
                        ]}
                    />
                </Form.Item>

                <Form.Item 
                    label={t("translation:time")}
                    name="time"
                >
                    <Select 
                        options={[
                            {value: 600,label: t("translation:time-info.m", {time: "10"})},
                            {value: 1800,label: t("translation:time-info.m", {time: "30"})},
                            {value: 3600,label: t("translation:time-info.h", {time: "1"})},
                            {value: 7200,label: t("translation:time-info.h", {time: "2"})},
                            {value: 14400,label: t("translation:time-info.h", {time: "4"})},
                            {value: 86400,label: t("translation:time-info.d", {time: "1"})},
                            {value: 259200,label: t("translation:time-info.d", {time: "3"})},
                            {value: 604800,label: t("translation:time-info.w", {time: "1"})}
                        ]}
                    />
                </Form.Item>
            </div>


            <div className="Publish-btns">
                <div className="btns">
                    <div className="left">
                        <Button onClick={() => ConfirmClearQuest(clearLocal)}>
                            {t("translation:btn-clear")}
                        </Button>
                    </div>
                    <div className="right">
                        {/* <Button type="primary" ghost>
                            {t("translation:btn-view")}
                        </Button> */}
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