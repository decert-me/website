import { Button, Form, Input, Radio } from "antd";
import {
    CaretRightOutlined,
} from '@ant-design/icons';
import { useState } from "react";
import CustomIcon from "../CustomIcon";
import { useUpdateEffect } from "ahooks";
import { useTranslation } from "react-i18next";

export default function Coding(props) {

    const { onChange, deleteCase, defaultValue, checkCode } = props;
    const { t } = useTranslation(["publish", "translation"]);
    let [logs, setLogs] = useState([]);
    let [loading, setLoading] = useState();

    async function Test(params) {
        setLoading(true);
        const arr = await checkCode();
        // logs.push(...arr);
        logs = arr;
        setLogs([...logs]);
        setLoading(false);
    }

    useUpdateEffect(() => {
        let container = document.querySelector('.coding .log-content');
        container.scrollTop = container.scrollHeight;
    },[logs])

    return (
        <div className="coding">
                <div className="case-close" onClick={deleteCase}>
                    <CustomIcon type="icon-close" />
                </div>
                <div className="form">
                    <div className="box">
                        <p className="box-label">{t("inner.in")}</p>
                        <Input onChange={(e) => onChange(e.target.value, "input")} defaultValue={defaultValue.input} />
                    </div>
                    <div className="box">
                        <p className="box-label">{t("inner.out")}</p>
                        <Input onChange={(e) => onChange(e.target.value, "output")} defaultValue={defaultValue.output} />
                    </div>
                    <Button 
                        className="test-btn"
                        onClick={Test}
                        disabled={!defaultValue.input || !defaultValue.output}
                        loading={loading}
                    >
                        <CaretRightOutlined />{t("inner.run-case")}
                    </Button>
                </div>
            {
                logs.length > 0 &&
                <div className="log">
                    <p className="log-label">
                    {t("inner.run-res")}
                    </p>
                    <ul className="log-content custom-scroll">
                        {
                            logs.map((e,i) => <li key={i} dangerouslySetInnerHTML={{__html: e.replace(/\n/g,"<br/>")}} />
                            )
                        }
                    </ul>
                </div>
            }
        </div>
    )
}