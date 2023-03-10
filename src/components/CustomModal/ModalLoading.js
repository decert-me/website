import { Button, Modal, Spin } from "antd";
import { LoadingOutlined, CloseOutlined } from '@ant-design/icons';
import { constans } from "@/utils/constans";

export default function ModalLoading(props) {

    const { ipfsPath, defaultImg, openseaLink } = constans();
    const { isModalOpen, handleCancel, isLoading, img, tokenId, shareTwitter } = props;

    const icon = (
        <LoadingOutlined
          style={{
            fontSize: 200,
          }}
          spin
        />
    );

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
                    <p className="loading-title">铸造中...</p>
                    <p className="loading-tip">SBT 是不可转让，也不可出售的。</p>
                </div>
                :
                <div className="content claimed">
                    <p className="title">你获得了一个SBT！</p>
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
            

                    <a href={`${openseaLink}/${tokenId}`} target="_blank" >查看SBT详情</a>
                    <Button className="btn" onClick={() => shareTwitter()}>分享到Twitter</Button>
                </div>
            }

        </Modal>
    )
}