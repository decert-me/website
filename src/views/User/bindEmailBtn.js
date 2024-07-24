import { bindSocialResult, cancelBindChange, confirmBindChange } from "@/request/api/public";
import { bindEmail, getEmailCode } from "@/request/api/social";
import { useRequest } from "ahooks";
import { Button, Input, Modal, Statistic } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RebindModal } from "./rebindModal";
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
        if (e?.length > 6) return
        setCode(e || "");
        if (e?.length === 6 && !flag) {
            flag = true;
            setFlag(flag);
            bindEmail({
                email,
                code: e
            })
            .then(res => {
                if (res) {
                    setIsOpenInner(false);
                    run();
                }else{
                    flag = false;
                    setFlag(flag);
                }
            })
            .catch(err => {
                console.log(err);   
            })
        }
    }

    function innerEmail(e) {
        setEmail(e);
    }

    async function rebind() {
        await confirmBindChange({type: "email"});
        Modal.destroyAll();
        run();
    }

    async function cancelBind() {
        await cancelBindChange({type: "email"});
        setLoading(false);
    }

    // 初始化检测是否绑定了 dicord || wechat
    function hasBindSocialAc(isInit) {
        bindSocialResult({"type": "email"})
        .then(res => {
            if (res.status === 0) {
                const { bound, current_binding_address } = res.data;
                // 如果有就弹窗提示是否换绑
                if (current_binding_address && !isInit) {
                    cancel();
                    Modal.info({
                        content: <RebindModal confirmBind={() => rebind()} current_binding_address={current_binding_address} social={"Email"} onCancel={() => cancelBind()} />,
                        icon: <></>,
                        footer: null
                    })
                }else if (bound) {
                    setIsBind(true);
                    setLoading(false); 
                    cancel();
                }
            }
        })
    }

    function init() {
        hasBindSocialAc(true);
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
                    <Input
                        type="number"
                        className="input"
                        value={code}
                        autoFocus
                        onChange={(e) => innerCode(e.target.value)}
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