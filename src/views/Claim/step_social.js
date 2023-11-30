import { authDiscord } from "@/request/api/public";
import { Button } from "antd";
import axios from "axios";



export default function StepSocial({step}) {
    
    function bindDiscord(params) {
        authDiscord()
        .then(res => {
            console.log(res);
        })
    }

    function bindWechat(params) {
        axios.get("http://wx.cdeer.xyz/wechat/getWechatQrcode")
        .then(res => {
            console.log(res);
        })
    }


    return (
        <div className={`CustomBox flex ${step === 1 ? "checked-flex" : ""}`}>
            <Button
                onClick={() => bindDiscord()}
                disabled={!step >= 1} 
            >
                绑定 Discord
            </Button>

            <Button
                onClick={() => bindWechat()}
                disabled={!step >= 1} 
            >
                绑定微信
            </Button>
        </div>
    )
}