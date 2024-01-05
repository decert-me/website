import MyContext from "@/provider/context";
import { hasBindSocialAccount } from "@/request/api/public";
import { bindDiscord } from "@/request/api/social";
import { useRequest } from "ahooks";
import { Button, message } from "antd";
import { useContext, useEffect, useState } from "react";



export default function BindDiscordBtn() {
    
    const { isMobile } = useContext(MyContext);
    const [pollingCount, setPollingCount] = useState(0);
    const [isDiscordLoad, setIsDiscordLoad] = useState(false);
    const [isBind, setIsBind] = useState(false);

    const { run, cancel } = useRequest(polling, {
        pollingInterval: 3000,
        manual: true
    });

    function polling() {
        setPollingCount(pollingCount + 1);
        hasBindSocialAc()
        if (pollingCount === 60) {
            cancel();
            setIsDiscordLoad(false);
            setPollingCount(0);
        }
    }

    async function bindDiscordAc(params) {
        setIsDiscordLoad(true);
        const { data: url } = await bindDiscord({callback: `${window.location.origin}/callback/discord`});
        window.open(url, 'popup', `width=${isMobile ? "375" : "700"},height=667`);
        // 轮询 ===>
        run();
    }

    // 初始化检测是否绑定了 dicord || wechat
    function hasBindSocialAc() {
        const notice = localStorage.getItem("decert.bind.notice");
        if (notice) {
            message.error(notice);
            localStorage.removeItem("decert.bind.notice");
            setIsDiscordLoad(false);
            cancel();
            return
        }
        hasBindSocialAccount()
        .then(res => {
            if (res.status === 0) {
                const { discord } = res.data;
                if (discord) {
                    setIsBind(true);
                    setIsDiscordLoad(false);
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
        <Button
            id="hover-btn-full" 
            className={isBind ? "isBind" : ""}
            onClick={() => bindDiscordAc()}
            loading={isDiscordLoad}
            disabled={isBind}
        >{isBind ? "已绑定" : "绑定Discord"}</Button>
    )
}