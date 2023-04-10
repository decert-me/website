import { getContracts } from "@/request/api/nft";
import { findFastestGateway } from "@/utils/LoadImg";
import { useUpdateEffect } from "ahooks";
import { Button, Skeleton } from "antd";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import ModalAddSbt from "./ModalAddSbt";




export default function CertNfts(props) {
    
    const { account, changeContractId, total, isMe } = props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    let [list, setList] = useState();
    let [selectItem, setSelectItem] = useState(0);

    const show = () => {
        setIsModalOpen(true);
    }

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const init = async() => {
        const contracts = await getContracts({address: account ? account : ethers.constants.AddressZero});
        if (!contracts || contracts.status !== 0) {
            return
        }
        list = contracts.data ? contracts.data : [];
        setTimeout(() => {
            setList([...list]);
        }, 1000);
    }

    useEffect(() => {
        init();
    },[account])

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
                    添加技能 SBT
                    <Button onClick={() => show()}>+</Button>
                </div>
            }
            {
                list ? 
                <>
                    <ul>
                        <li
                            className={`${selectItem === 0 ? "active" : ""}`}
                            onClick={() => {setSelectItem(0)}}
                        >
                            <div></div>
                            <p className="li-content">全部</p>
                            <p>({total ? total : 0})</p>
                        </li>
                        {
                            list.map(e => 
                                <li 
                                    key={e.id} 
                                    className={`${selectItem === e.id ? "active" : ""}`}
                                    onClick={() => {setSelectItem(e.id)}}
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
                account &&
                <ModalAddSbt 
                    isModalOpen={isModalOpen} 
                    handleCancel={handleCancel}
                />
            }
        </div>
    )
}