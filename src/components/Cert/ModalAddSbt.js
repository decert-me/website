import { Modal } from "antd";
import {
    CloseCircleOutlined,
} from '@ant-design/icons';
import "@/assets/styles/component-style/cert/modal-addsbt.scss"
import AddSbt from "./AddSbt";
import { useNavigate } from "react-router-dom";
import MyContext from "@/provider/context";
import { useContext } from "react";

export default function ModalAddSbt(props) {
    const { isModalOpen, handleCancel } = props;
    const navigateTo = useNavigate();
    const { isMobile } = useContext(MyContext);

    return (
        <Modal
            className={`${isMobile ? "ModalAddSbt-mobile" : "ModalAddSbt"}`}
            footer={null}
            open={isModalOpen}
            onCancel={handleCancel}
            afterClose={() => {
                navigateTo(0);
            }}
            closeIcon={<CloseCircleOutlined />}
            destroyOnClose
            width="1164px"
        >
            <AddSbt handleCancel={handleCancel} />
        </Modal>
    )
}