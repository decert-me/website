import { Modal } from "antd";
import {
    CloseCircleOutlined,
} from '@ant-design/icons';
import "@/assets/styles/component-style/cert/modal-addsbt.scss"
import AddSbt from "./AddSbt";

export default function ModalAddSbt(props) {
    const { isModalOpen, handleCancel } = props;

    return (
        <Modal
            className="ModalAddSbt"
            footer={null}
            open={isModalOpen}
            onCancel={handleCancel}
            closeIcon={<CloseCircleOutlined />}
            destroyOnClose
            width="1050px"
        >
            <AddSbt handleCancel={handleCancel} />
        </Modal>
    )
}