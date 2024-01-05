import { hasBindSocialAccount } from "@/request/api/public";
import { bindWechat } from "@/request/api/social";
import { useRequest } from "ahooks";
import { Button, Popover, Spin } from "antd";
import { useEffect, useState } from "react";



export default function BindWechatBtn() {
    
    const [pollingCount, setPollingCount] = useState(0);
    const [isWechatLoad, setIsWechatLoad] = useState();
    const [isBind, setIsBind] = useState(false);
    const [qrCode, setQrCode] = useState();

    const { run, cancel } = useRequest(polling, {
        pollingInterval: 3000,
        manual: true
    });

    function polling() {
        setPollingCount(pollingCount + 1);
        hasBindSocialAc()
        if (pollingCount === 60) {
            cancel();
            setIsWechatLoad(false);
            setPollingCount(0);
        }
    }

    async function bindWechatAc(params) {
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
                const { wechat } = res.data;
                if (wechat) {
                    setIsBind(true);
                    setIsWechatLoad(false);
                    setQrCode(null);
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
        <Popover
            trigger="focus"
            content={(
                !isBind &&
                <div className="qrcode">
                    <Spin spinning={!qrCode} size="large" wrapperClassName="qrcop">
                        <img src={qrCode} alt="" style={{width: 104, height: 104}} />
                    </Spin>
                </div>
            )}
            overlayClassName="qrcode-box"
            // getPopupContainer={() => document.querySelector(".Lead")}
            placement="rightBottom"
        >
            {/* <Button id="hover-btn-full" onClick={bindWechatAc}>bindWechat</Button> */}
            <Button
                id="hover-btn-full" 
                className={isBind ? "isBind" : ""}
                onClick={() => bindWechatAc()}
                loading={isWechatLoad}
                disabled={isBind}
            >{isBind ? "已绑定" : "绑定Wechat"}</Button>
        </Popover>
        
    )
}