import { MinusCircleOutlined, PlusCircleFilled } from "@ant-design/icons";
import { Button, Form, Input, Select } from "antd";
import { useTranslation } from "react-i18next";

export default function CustomAddAnswer(props) {

  const { fields } = props;

  const { t } = useTranslation(['publish', 'translation']);

    return (
        <Form.List 
          name={"options"} 
          initialValue={fields ? fields : []}
        >
        {(fields, { add, remove }) => (
          <div style={{ borderBottom: "1px solid #D8D8D8" }}>
            {fields.map(({ key, name, ...restField }) => ( 
                <div
                  key={key}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                  }}
                >
                  <Form.Item
                    {...restField}
                    name={[name, "title"]}
                    rules={[
                      {
                        required: true,
                        message: t("inner.rule.answer"),
                      },
                    ]}
                  >
                    <Input style={{ width: 400, marginRight: "5px" }} placeholder={t("inner.placeholder.answer")} />
                  </Form.Item>
                  {fields.length === 1 ? null : (
                    <Form.Item
                      {...restField}
                      name={[name, "options"]}
                      initialValue={1}
                    >
                      <Select
                        style={{
                          width: 120,
                          marginRight: "10px",
                        }}
                        options={[
                          {
                            value: 2,
                            label: t("inner.true"),
                          },
                          {
                            value: 1,
                            label: t("inner.false"),
                          },
                        ]}
                      />
                    </Form.Item>
                  )}
                  {fields.length === 1 ? null : <MinusCircleOutlined onClick={() => remove(name)} />}
                </div>
            ))}
            <div
              style={{
                marginBottom: "10px",
                display: "flex",
                alignItems: "center"
              }}
            >
              <Button 
                type="link" 
                style={{ 
                  textAlign: "left",
                  padding: 0,
                  fontSize: "18px"
                }} 
                onClick={() => add()} 
              >
                <PlusCircleFilled />
                <span style={{
                  color: "#282828"
                }}>
                {t("translation:btn-add-answer")}
                </span>
              </Button>
              <p 
                style={{
                  marginLeft: "16px",
                  color: "#999999"
                }}
              >
                <span style={{color: "#FF0000"}}>*</span>
                {t("inner.rule.add")}
              </p>
            </div>
          </div>
        )}
      </Form.List>
    )
}