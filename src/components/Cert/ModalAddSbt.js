import { Modal } from "antd";
import {
    CloseOutlined,
} from '@ant-design/icons';
import "@/assets/styles/component-style/cert/modal-addsbt.scss"
import AddSbt from "./AddSbt";

export default function ModalAddSbt(props) {
    const { isModalOpen, handleCancel, isMobile } = props;

    return (
        <Modal
            className={`ModalAddSbt ${isMobile ? "ModalAddSbt-mobile" : ""}`}
            footer={null}
            open={isModalOpen}
            onCancel={handleCancel}
            closeIcon={<CloseOutlined />}
            destroyOnClose
            width="1220px"
        >
            <AddSbt handleCancel={handleCancel} />
        </Modal>
    )
}