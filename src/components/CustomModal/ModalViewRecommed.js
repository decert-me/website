import { Modal } from "antd";
import { useState } from "react";
import {
    ExpandOutlined
} from '@ant-design/icons';
import "@/assets/styles/component-style/modal-recommed.scss"
import { Viewer } from "@bytemd/react";

export default function ModalViewRecommed(props) {

    const { text, plugins } = props;
    const [isModalOpen, setIsModalOpen] = useState(false);

    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <>
        <Modal 
            className="ModalViewRecommed"
            open={isModalOpen} 
            onOk={handleOk} 
            onCancel={handleCancel}
            footer={null}
            width="1136px"
        >
            <div className="content">
                <Viewer value={text} plugins={plugins} />
            </div>
        </Modal>
            <p onClick={showModal}>
                <ExpandOutlined style={{ marginRight: "10px" }} />
                查看全文
            </p>
        </>
    )
}