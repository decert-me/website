import { useAddress } from "@/hooks/useAddress";
import { Button, Modal } from "antd";
import { useTranslation } from "react-i18next";


export function RebindModal({confirmBind, current_binding_address, social}) {

    const { address } = useAddress();
    const { t } = useTranslation(["profile"]);
    
    return (
        <div className="rebind-modal">
            <p className="title">{t("tips")}：</p>
            <p className="text">{t("reBind",{user:current_binding_address, social})}</p>
            <p className="text">{t("reBind2",{user: address})}</p>
            <div className="btns">
                <Button type="primary" color="#E2E2E2" onClick={() => Modal.destroyAll()}>{t("cancel")}</Button>
                <Button type="primary" onClick={confirmBind}>{t("confirm")}</Button>
            </div>
        </div>
    )
}