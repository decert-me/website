import MyContext from "@/provider/context";
import { bindSocialResult, cancelBindChange, confirmBindChange } from "@/request/api/public";
import { bindGithub } from "@/request/api/social";
import { useRequest } from "ahooks";
import { Button, message, Modal } from "antd";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RebindModal } from "./rebindModal";



export default function BindGithubBtn() {
    
    const { t } = useTranslation(["profile"]);
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
        const { data: url } = await bindGithub({callback: `${window.location.origin}/callback/github`});
        window.open(url, 'popup', `width=${isMobile ? "375" : "700"},height=667`);
        // 轮询 ===>
        run();
    }

    async function rebind() {
        await confirmBindChange({type: "github"})
        Modal.destroyAll();
        run();
    }

    async function cancelBind() {
        await cancelBindChange({type: "github"});
        setIsDiscordLoad(false);
    }

    // 初始化检测是否绑定了 dicord || wechat
    function hasBindSocialAc(isInit) {
        const notice = localStorage.getItem("decert.bind.notice");
        if (notice && !isInit) {
            message.error(notice);
            localStorage.removeItem("decert.bind.notice");
            setIsDiscordLoad(false);
            cancel();
            return
        }
        bindSocialResult({"type": "github"})
        .then(res => {
            if (res.status === 0) {
                const { bound, current_binding_address } = res.data;
                // 如果有就弹窗提示是否换绑
                if (current_binding_address && !isInit) {
                    cancel();
                    Modal.info({
                        content: <RebindModal confirmBind={() => rebind()} current_binding_address={current_binding_address} social={"Github"} onCancel={() => cancelBind()} />,
                        icon: <></>,
                        footer: null,
                        onCancel: () => {setIsDiscordLoad(false)}
                    })
                }else if (bound) {
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
        hasBindSocialAc(true);
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
        >{isBind ? t("isBind") : t("bindGh")}</Button>
    )
}