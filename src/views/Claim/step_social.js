import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRequest, useUpdateEffect } from "ahooks";
import { Button, Popover, Spin } from "antd";
import { WechatOutlined } from '@ant-design/icons';
import { bindDiscord, bindWechat } from "@/request/api/social";
import { hasBindSocialAccount } from "@/request/api/public";
import MyContext from "@/provider/context";


export default function StepSocial({step, setStep, defaultValue}) {
    
    const { isMobile } = useContext(MyContext);
    const { t } = useTranslation(["claim", "translation"]);
    const [isDiscordLoad, setIsDiscordLoad] = useState();
    const [isWechatLoad, setIsWechatLoad] = useState();
    const [qrCode, setQrCode] = useState();
    const [count, setCount] = useState(0);
    let [bindObj, setBindObj] = useState({
        discord: false,
        wechat: false
    })

    // 轮询检测是否绑定social ===>
    const { run, cancel } = useRequest(hasBindSocialAc, {
        pollingInterval: 3000,
        manual: true
    });


    async function bindDiscordAc(params) {
        setIsDiscordLoad(true);
        const { data: url } = await bindDiscord({callback: `${window.location.origin}/callback/discord`});
        window.open(url, 'popup', 'width=375,height=667');
        // 轮询 ===>
        run();
    }

    function bindWechatAc(params) {
        setIsWechatLoad(true);
        bindWechat()
        .then(res => {
            if (res?.data) {
                setQrCode(res.data);
                // 轮询 ===>
                run();
            }
        })
    }

    // 初始化检测是否绑定了 dicord || wechat
    function hasBindSocialAc() {
        hasBindSocialAccount()
        .then(res => {
            if (res.status === 0) {
                const { discord, wechat } = res.data;
                bindObj = res.data;
                setBindObj({...bindObj});
                discord && setIsDiscordLoad(false);
                wechat && setIsWechatLoad(false);
                if ((discord || wechat) && step === 1) {
                    setStep(2);
                    cancel();
                }else if (count === 100 || (discord && wechat)) {
                    cancel();
                    setCount(0);
                }else{
                    setCount(count+1);
                }
                
            }
        })
        .catch(err => {
            console.log(err);
        })
    }

    useUpdateEffect(() => {
        step === 1 && hasBindSocialAc();
    },[step])

    useUpdateEffect(() => {
        if (defaultValue) {
            bindObj = defaultValue;
            setBindObj({...bindObj});
        }
    },[defaultValue])


    return (
        <div className={`CustomBox flex ${step === 1 ? "checked-flex" : ""}`}>
            {
                bindObj.discord ?
                <Button disabled className="is-bind">
                    已绑定
                </Button>
                :
                <Button
                    onClick={() => bindDiscordAc()}
                    disabled={!step >= 1} 
                    loading={isDiscordLoad}
                >
                    绑定 Discord
                </Button>
            }

            {
                bindObj.wechat ? 
                <Button disabled className="is-bind">
                    已绑定
                </Button>
                :
                <Popover
                    trigger="click"
                    content={(
                        <div className="qrcode">
                            <Spin spinning={!qrCode} size="large" wrapperClassName="qrcop">
                                <img src={qrCode} alt="" style={{width: 104, height: 104}} />
                            </Spin>
                            <div
                                style={{
                                    width: 122,
                                    display: "flex",
                                    alignItems: "flex-start",
                                    marginTop: 17
                                }}
                            >
                                <WechatOutlined /><p>{t("translation:share-text")}</p>
                            </div>
                        </div>
                    )}
                    overlayClassName={`qrcode-box ${isMobile ? "hide" : ""}`}
                    getPopupContainer={() => document.querySelector(".Claim")}
                    placement="rightBottom"
                    // open={qrCode}
                >
                    <Button
                        onClick={() => bindWechatAc()}
                        disabled={!step >= 1} 
                        loading={isWechatLoad}
                    >
                        绑定微信
                    </Button>
                </Popover>
            }
        </div>
    )
}