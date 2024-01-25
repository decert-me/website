import { Modal } from "antd";
import "@/assets/styles/component-style/modal-img.scss";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { toPng } from "html-to-image";
import { useTranslation } from "react-i18next";
import { ipfsImg } from "@/request/api/public";


export default function ModalImgCard(props) {
    
    const { isModalOpen, handleCancel, isMobile } = props;

    const { t } = useTranslation(["claim"]);

    async function shareNFT() {
//         const text = `很高兴完成了一个新的挑战 。

// 我从 @decertme 获得一个 NFT 勋章。

// 你也可以参与挑战：${isModalOpen.attributes.challenge_url}

// #DeCert`
//         const url = "https://twitter.com/intent/tweet?text=";
//         window.open(url+encodeURIComponent(text), "_blank");
        try {
            const url = isModalOpen.attributes.challenge_url + "?q=" + isModalOpen.image.replace("ipfs://", "");
            const text = t("claim.share.title", {what: t("getNft"), challenge: url});
            const shareUrl = "https://twitter.com/intent/tweet?text=";
            window.open(shareUrl+text, "_blank");
            // window.open(shareUrl+encodeURIComponent(text), "_blank");
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <Modal
            className={`ModalImgCard ${isMobile ? "ModalImgCard-mobile" : ""}`}
            open={isModalOpen}
            onCancel={handleCancel}
            footer={null}
            width={464}
            closeIcon={<></>}
            centered
        >
            <div className="imgCard-content">
                <div className="content">
                    <LazyLoadImage src={isModalOpen?.image.replace("ipfs://", "https://ipfs.decert.me/")}/>
                </div>
            </div>
            <div className="imgCard-btns">
                <button className="full" onClick={shareNFT}>
                    <img src={require("@/assets/images/icon/icon-x.png")} alt="" />
                </button>
            </div>
        </Modal>
    )
}