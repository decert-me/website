import { Button, Modal, Spin } from "antd";
import { LoadingOutlined, CloseOutlined } from '@ant-design/icons';
import { constans } from "@/utils/constans";
import { useTranslation } from "react-i18next";
import MyContext from "@/provider/context";
import { useContext } from "react";

export default function ModalLoading(props) {

    const { ipfsPath, defaultImg, openseaLink } = constans();
    const { t } = useTranslation(["translation"]);
    const { isMobile } = useContext(MyContext);
    const { isModalOpen, handleCancel, isLoading, img, tokenId, shareTwitter } = props;

    const icon = (
        <LoadingOutlined
          style={{
            fontSize: isMobile ? 100 : 200,
          }}
          spin
        />
    );

    return (
        <Modal
            className={`ModalLoading ${isMobile ? "ModalLoading-mobile" : ""}`}
            open={isModalOpen}
            onCancel={handleCancel}
            footer={null}
            width="auto"
            closeIcon={<CloseOutlined style={{fontSize: 24, color: "#000"}} />}
            centered
        >
            {
                isLoading ? 
                <div className="content claiming">
                    <div className="loading">
                        <Spin indicator={icon} />
                    </div>
                    <p className="loading-title">{t("modal.claim.claiming")}</p>
                    <p className="loading-tip">{t("modal.claim.desc")}</p>
                </div>
                :
                <div className="content claimed">
                    <p className="title">{t("modal.claim.claimed")}</p>
                    <div className="img">
                        <img 
                            src={
                                img.split("//")[1]
                                    ? `${ipfsPath}/${img.split("//")[1]}`
                                    : defaultImg
                            } 
                            alt="" 
                        />
                    </div>
            

                    <a href={`${openseaLink}/${tokenId}`} target="_blank" >{t("modal.claim.link")}</a>
                    <Button className="btn" onClick={() => shareTwitter()}>{t("modal.claim.share")}</Button>
                </div>
            }

        </Modal>
    )
}