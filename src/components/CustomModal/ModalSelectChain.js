import { Button, Modal } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNetwork } from "wagmi";



function ModalSelectChain(props) {

    const { isModalOpen, handleCancel, airpost } = props;
    const { t } = useTranslation();
    const { chains } = useNetwork();
    const [selectChain, setSelectChain] = useState(chains[0]?.id);

    function goAirpost() {
        airpost(selectChain);
        handleCancel();
    }
    
    return (
        <Modal
            className="ModalConnect airpost" 
            open={isModalOpen}
            onCancel={handleCancel}
            footer={null}
            width={400}
            centered
            title={t("selectNet")}
        >
            {
                chains.map(chain => (
                    <div
                        key={chain.id}
                        className="wallet-item"
                        onClick={() => setSelectChain(chain.id)}
                    >
                        <div className="item">
                            <div className="img">
                                <img src={chain.img} alt="" />
                            </div>
                            <p className="name">
                                {chain.name}
                            </p>
                            {
                                selectChain == chain.id &&
                                <div className="status"></div>
                            }
                        </div>
                    </div>
                ))
            }
            <Button 
                id="hover-btn-full" 
                className="airpost-btn" 
                disabled={!selectChain}
                onClick={() => goAirpost()}>
                {t("btn-confirm")}</Button>
        </Modal>
    )
}
export default ModalSelectChain