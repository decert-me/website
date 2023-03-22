import { getContracts } from "@/request/api/nft";
import { findFastestGateway } from "@/utils/LoadImg";
import { useUpdateEffect } from "ahooks";
import { Button, List, Skeleton } from "antd";
import { useEffect, useState } from "react";
import ModalAddSbt from "./ModalAddSbt";




export default function CertNfts(props) {
    
    const { account, changeContract, total, isMe } = props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    let [list, setList] = useState();
    let [selectItem, setSelectItem] = useState();

    const show = () => {
        setIsModalOpen(true);
    }

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const init = async() => {
        const contracts = await getContracts({address: account});
        if (!contracts.data) {
            return
        }
        list = contracts.data;
        setTimeout(() => {
            setList([...list]);
            setSelectItem(0);
        }, 1000);
    }

    useEffect(() => {
        init();
    },[account])

    useUpdateEffect(() => {
        let check;
        if (selectItem === 0) {
            check = {
                address: account
            }
        }else{
            list.map(e => {
                if (e.id === selectItem) {
                    check = {
                        address: account,
                        contract_id: e.id
                    }
                }
            })
        }
        changeContract(check)
    },[selectItem])

    return (

        <div className="nfts">
            <p>SBT 收藏:</p>
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
                            <p>({total})</p>
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

            <ModalAddSbt isModalOpen={isModalOpen} handleCancel={handleCancel} />
        </div>
    )
}