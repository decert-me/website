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
                title="绑定邮箱"
                rootClassName="email-modal"
            >
                <p className="text">绑定邮箱，可第一时间收到评分结果。</p>
                <Input onChange={(e) => innerEmail(e.target.value)} placeholder="email address" />
                <Button id="hover-btn-full" onClick={sendMsg} type="primary">下一步</Button>
            </Modal>
            {/* 发送验证码 */}
            <Modal
                open={isOpenInner}
                onCancel={hidenModal}
                footer={null}
                closeIcon={null}
                width={500}
                title="输入验证码"
                rootClassName="email-code-modal"
            >
                <p className="text">验证码已发送到{email}</p>
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
                    <Countdown rootClassName="time" suffix="秒" value={time} onFinish={onFinish} format="s" />
                }
                <Button disabled={time} id="hover-btn-full" onClick={reSendMsg} type="primary">重新发送</Button>
            </Modal>
            <Button
                id="hover-btn-full" 
                className={isBind ? "isBind" : ""}
                onClick={() => showModal()}
                loading={loading}
                disabled={isBind}
            >{isBind ? t("isBind") : "绑定邮箱"}</Button>
        </>
    )
}