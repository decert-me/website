import { Button, Modal, Spin } from "antd";
import { LoadingOutlined, CloseOutlined } from '@ant-design/icons';

export default function ModalLoading(props) {
    
    const { isModalOpen, handleCancel, isLoading } = props;

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
                    <p className="loading-title">Minting your SBT Badge</p>
                    <p className="loading-tip">SBT are non-transferrable and cannot be sold.</p>
                </div>
                :
                <div className="content claimed">
                    <p className="title">你获得了一个SBT！</p>
                    <div className="img">
                        <img src="" alt="" />
                    </div>
                    <a href="#">查看SBT详情</a>
                    <Button className="btn">分享到Twitter</Button>
                </div>
            }

        </Modal>
    )
}