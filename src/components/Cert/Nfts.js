import { findFastestGateway } from "@/utils/LoadImg";
import { useUpdateEffect } from "ahooks";
import { Button, Skeleton } from "antd";
import {
    RightOutlined
} from '@ant-design/icons';
import { useState } from "react";
import ModalAddSbt from "./ModalAddSbt";
import { useTranslation } from "react-i18next";




export default function CertNfts(props) {
    
    const { changeContractId, total, isMe, nftlist: list, isMobile, goAddSbt, options } = props;
    const { t } = useTranslation(["translation", "cert"]);
    let [selectItem, setSelectItem] = useState(isMobile ? null : 0);

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
                    <Button id="hover-btn-full" onClick={() => goAddSbt()}>+</Button>
                </div>
            }
            {
                list ? 
                <>
                    <ul className=" custom-scroll">
                        <li
                            className={`${selectItem === 0 ? "active" : ""}`}
                            onClick={() => change(0)}
                        >
                            {/* <div></div> */}
                            <div className="img">
                                <img src={require("@/assets/images/icon/all-sbt.png")} alt="" />
                            </div>
                            <p className="li-content">{t("cert:sidbar.list.all")}</p>
                            <p>({total ? total : 0})</p>
                            {
                                selectItem === 0 && 
                                <RightOutlined className="poa" />
                            }
                        </li>
                        {
                            list.map(e => 
                                <li 
                                    key={e.id} 
                                    className={`${selectItem === e.id ? "active" : ""}`}
                                    onClick={() => change(e.id)}
                                >
                                    <div className="img">
                                        <img src={e.contract_logo ? process.env.REACT_APP_NFT_BASE_URL + "/v1" + e.contract_logo : require("@/assets/images/img/default-contract.png")} alt="" />
                                        <div className="badge">
                                            {
                                                options.map(item => {
                                                    if (item.nftscan === e.chain) {
                                                        return <img src={item.icon} alt="" key={e.id} />
                                                    }
                                                })
                                            }
                                        </div>
                                    </div>
                                    <p className="li-content">{e.contract_name}</p>
                                    <p>({e.count})</p>
                                    {
                                        selectItem === e.id && 
                                        <RightOutlined className="poa" />
                                    }
                                </li>    
                            )
                        }
                    </ul>
                </>
                :
                <Skeleton active />
            }
        </div>
    )
}