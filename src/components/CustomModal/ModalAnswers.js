import {
    CloseSquareOutlined
} from '@ant-design/icons';
import { Button, Modal } from "antd";
import "@/assets/styles/component-style"
import { useTranslation } from 'react-i18next';
import MyContext from '@/provider/context';
import { useContext } from 'react';


export default function ModalAnswers(props) {
    
    const { isModalOpen, handleCancel, submit, answers, changePage } = props;
    const { t } = useTranslation(["explore", "translation"]);
    const { isMobile } = useContext(MyContext);

    const checkPage = (i) => {
        handleCancel()
        changePage(i+1)
    }

    const checkSubmit = () => {
        Modal.destroyAll();
        submit();
    }

    return (
        <Modal
            className={`ModalAnswers ${isMobile ? "mobile-ModalAnswers" : ""}`} 
            open={isModalOpen}
            onCancel={handleCancel}
            footer={null}
            width={842}
            centered
            maskClosable={false}
            destroyOnClose={true}
            closeIcon={<CloseSquareOutlined style={{fontSize: "33px", color: "#000"}} />}
        >
            <h5>{t("modal.challenge.title")}</h5>
            <ul className="tips">
                <li><div className="point success" />{t("modal.challenge.complete")}</li>
                <li><div className="point normal" />{t("modal.challenge.uncomplete")}</li>
            </ul>
            
            <ul className="answers">
                {
                    answers.map((e,i) => 
                        <li 
                            key={i} 
                            className={`point ${e || e === 0 ? "success":"normal"}`}
                            onClick={() => checkPage(i)}
                        >{i+1}</li>
                    )
                }
            </ul>

            <Button className='submit' onClick={checkSubmit}>{t("translation:btn-sumbit-confirm")}</Button>
            
        </Modal>
    )
}