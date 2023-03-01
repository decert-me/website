import { Button, Modal, Spin } from "antd";
import { LoadingOutlined, CloseOutlined } from '@ant-design/icons';
import BadgeAddress from "@/contracts/Badge.address";

export default function ModalLoading(props) {
    
    const { isModalOpen, handleCancel, isLoading, img, tokenId } = props;

    const icon = (
        <LoadingOutlined
          style={{
            fontSize: 200,
          }}
          spin
        />
      );

    const shareTwitter = () => {
        let title = "I claim a SBT on @DecertMe";
        let url = `https://decert.me/quests/${tokenId}`;
        window.open(
        `https://twitter.com/share?text=${title}%0A${"by completing this challenge: "}&hashtags=${"DecertMe"}&url=${url}%0A%0A`,
        );
    }

    return (
        <Modal
            className="ModalLoading" 
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
                    <p className="loading-title">Minting your SBT Badge</p>
                    <p className="loading-tip">SBT are non-transferrable and cannot be sold.</p>
                </div>
                :
                <div className="content claimed">
                    <p className="title">你获得了一个SBT！</p>
                    <div className="img">
                        <img 
                            src={
                                img.split("//")[1]
                                    ? `http://ipfs.learnblockchain.cn/${img.split("//")[1]}`
                                    : 'assets/images/img/default.png'
                            } 
                            alt="" 
                        />
                    </div>
            

                    <a href={`https://testnets.opensea.io/assets/${process.env.REACT_APP_CHAIN_NAME}/${BadgeAddress}/${tokenId}`} target="_blank" >查看SBT详情</a>
                    <Button className="btn" onClick={() => shareTwitter()}>分享到Twitter</Button>
                </div>
            }

        </Modal>
    )
}