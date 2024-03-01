import { hasBindSocialAccount } from "@/request/api/public";
import { bindEmail, getEmailCode } from "@/request/api/social";
import { useRequest } from "ahooks";
import { Button, Input, InputNumber, Modal, Statistic } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
const { Countdown } = Statistic;



export default function BindEmailBtn(params) {

    const { t } = useTranslation(["profile"]);
    const [pollingCount, setPollingCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenInner, setIsOpenInner] = useState(false);
    const [isBind, setIsBind] = useState(false);
    const [code, setCode] = useState("");
    const [email, setEmail] = useState("");
    const [time, setTime] = useState(null);
    let [flag, setFlag] = useState(false);

    const { run, cancel } = useRequest(polling, {
        pollingInterval: 3000,
        manual: true
    });

    function polling() {
        setPollingCount(pollingCount + 1);
        hasBindSocialAc()
        if (pollingCount === 60) {
            cancel();
            setLoading(false);
            setPollingCount(0);
        }
    }

    function showModal() {
        setIsOpen(true);
        setLoading(true);
    }

    function hidenModal() {
        setIsOpen(false);
        setIsOpenInner(false);
        setLoading(false); 
    }

    function validateEmail(email) {
        const re = /^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/;
        return re.test(email);
    }

    function sendMsg() {
        if (!validateEmail(email)) return;
        // 发送验证码 => 展开
        getEmailCode({ email });
        setTime(Date.now() + 1000 * 60);
        setIsOpen(false);
        setIsOpenInner(true);
    }

    function reSendMsg(params) {
        getEmailCode({ email });
        setTime(Date.now() + 1000 * 60);
    }

    function onFinish(params) {
        setTime(null);
    }

    function innerCode(e) {
        setCode(e?.toString() || "");
        if (e.toString().length === 6 && !flag) {
            flag = true;
            setFlag(flag);
            bindEmail({
                email,
                code: e.toString()
            })
            setIsOpenInner(false);
            run();
        }
    }

    function innerEmail(e) {
        setEmail(e);
    }

    // 初始化检测是否绑定了 dicord || wechat
    function hasBindSocialAc() {
        hasBindSocialAccount()
        .then(res => {
            if (res.status === 0) {
                const { email } = res.data;
                if (email) {
                    setIsBind(true);
                    setLoading(false); 
                    cancel();
                }
            }
        })
        .catch(err => {
            console.log(err);
        })
    }

    function init() {
        hasBindSocialAc();
    }

    useEffect(() => {
        init();
    },[])
    
    return (
        <>
            {/* 绑定邮箱 */}
            <Modal
                open={isOpen}
                onCancel={hidenModal}
                footer={null}
                closeIcon={null}
                width={500}
                title={t("emailCode.title1")}
                rootClassName="email-modal"
            >
                {/* <p className="text">{t("emailCode.subtitle1")}</p> */}
                <Input onChange={(e) => innerEmail(e.target.value)} placeholder={t("emailCode.placeholder")} />
                <Button id="hover-btn-full" onClick={sendMsg} type="primary">{t("emailCode.next")}</Button>
            </Modal>
            {/* 发送验证码 */}
            <Modal
                open={isOpenInner}
                onCancel={hidenModal}
                footer={null}
                closeIcon={null}
                width={500}
                title={t("emailCode.title2")}
                rootClassName="email-code-modal"
            >
                <p className="text">{t("emailCode.subtitle2")}{email}</p>
                <div className="inner">
                    {
                        new Array(6).fill(0).map((e,index) => (
                            <div key={index} className={index === code.length ? "active" : ""}>
                                {code[index] || ""}
                            </div>
                        ))
                    }
                    <InputNumber 
                        className="input"
                        value={code}
                        autoFocus
                        onChange={(e) => innerCode(e)}
                        maxLength={6}
                        controls={false}
                    />
                </div>

                    
                {
                    time &&
                    <Countdown rootClassName="time" suffix={t("emailCode.s")} value={time} onFinish={onFinish} format="s" />
                }
                <Button disabled={time} id="hover-btn-full" onClick={reSendMsg} type="primary">{t("emailCode.resend")}</Button>
            </Modal>
            <Button
                id="hover-btn-full" 
                className={isBind ? "isBind" : ""}
                onClick={() => showModal()}
                loading={loading}
                disabled={isBind}
            >{isBind ? t("isBind") : t("bindEm")}</Button>
        </>
    )
}