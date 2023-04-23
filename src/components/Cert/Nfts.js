import { findFastestGateway } from "@/utils/LoadImg";
import { useUpdateEffect } from "ahooks";
import { Button, Skeleton } from "antd";
import { useState } from "react";
import ModalAddSbt from "./ModalAddSbt";
import { useTranslation } from "react-i18next";




export default function CertNfts(props) {
    
    const { ensParse, changeContractId, total, isMe, nftlist: list, isMobile, goAddSbt } = props;
    const { t } = useTranslation(["translation", "cert"]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    let [selectItem, setSelectItem] = useState(isMobile ? null : 0);

    const show = () => {
        if (isMobile) {
            goAddSbt()
            return
        }
        setIsModalOpen(true);
    }

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const change = (id) => {
        if (isMobile && id === selectItem) {
            changeContractId(id) 
        }
        setSelectItem(id);
    }

    useUpdateEffect(() => {
        if (selectItem === 0) {
            changeContractId(null)
        }
        list.map(e => {
            if (e.id === selectItem) {
                changeContractId(e.id)
            }
        })
        
    },[selectItem])

    return (

        <div className="nfts">
            {
                isMe &&
                <div className="add">
                    <p>{t("cert:sidbar.list.add")}</p>
                    <Button onClick={() => show()}>+</Button>
                </div>
            }
            {
                list ? 
                <>
                    <ul>
                        <li
                            className={`${selectItem === 0 ? "active" : ""}`}
                            onClick={() => change(0)}
                        >
                            <div></div>
                            <p className="li-content">{t("cert:sidbar.list.all")}</p>
                            <p>({total ? total : 0})</p>
                        </li>
                        {
                            list.map(e => 
                                <li 
                                    key={e.id} 
                                    className={`${selectItem === e.id ? "active" : ""}`}
                                    onClick={() => change(e.id)}
                                >
                                    <div className="img">
                                        <img src={process.env.REACT_APP_NFT_BASE_URL+e.contract_logo} alt="" />
                                    </div>
                                    <p className="li-content">{e.contract_name}</p>
                                    <p>({e.count})</p>
                                </li>    
                            )
                        }
                    </ul>
                </>
                :
                <Skeleton active />
            }
            {
                ensParse.address &&
                <ModalAddSbt 
                    isModalOpen={isModalOpen} 
                    handleCancel={handleCancel}
                />
            }
        </div>
    )
}