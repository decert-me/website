import { getContracts } from "@/request/api/nft";
import { findFastestGateway } from "@/utils/LoadImg";
import { Button, List, Skeleton } from "antd";
import { useEffect, useState } from "react";
import ModalAddSbt from "./ModalAddSbt";




export default function CertNfts(props) {
    
    const { account } = props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    let [list, setList] = useState();

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
        }, 1000);
    }

    useEffect(() => {
        init();
    },[])

    return (

        <div className="nfts">
            <p>SBT 收藏:</p>
            <div className="add">
                添加技能 SBT
                <Button onClick={() => show()}>+</Button>
            </div>
            {
                list ? 
                <>
                    <p className="list-title">全部（{list.length}）</p>
                    <ul>
                        {
                            list.map(e => 
                                <li key={e.id}>
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