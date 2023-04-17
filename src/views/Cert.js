import { Divider, Spin } from "antd";
import {
    LoadingOutlined
} from '@ant-design/icons';
import { useEffect, useState } from "react";
import "@/assets/styles/view-style/cert.scss"
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "react-router-dom";
import CertSearch from "@/components/Cert/Search";
import CertUser from "@/components/Cert/User";
import CertNfts from "@/components/Cert/Nfts";
import { getAllNft, getContracts, modifyNftStatus } from "@/request/api/nft";
import NftBox from "@/components/Cert/NftBox";
import { useUpdateEffect } from "ahooks";
import { useAccount } from "wagmi";
import { getEns } from "@/request/api/public";


const LoadingComponents = (
    <div className="loading">
        <Spin 
            indicator={
                <LoadingOutlined
                    style={{
                    fontSize: 24,
                    }}
                    spin
                />
            } 
        />
        <p>加载中...</p>
    </div>
)

export default function Cert(params) {
    
    const { t } = useTranslation(["translation","profile", "explore"]);
    const location = useLocation();
    const { address: urlAddr } = useParams();
    const { address } = useAccount();

    let [isMe, setIsMe] = useState();
    let [list, setList] = useState([]);
    let [nftlist, setNftList] = useState();
    let [total, setTotal] = useState();
    let [checkTotal, setCheckTotal] = useState({
        all: 0, open: 0, hide: 0
    });
    let [pageConfig, setPageConfig] = useState({
        page: 0, pageSize: 12
    })
    let [loading, setLoading] = useState(true);
    let [selectStatus, setSelectStatus] = useState();
    let [selectContract, setSelectContract] = useState();
    let [ensParse, setEnsParse] = useState({
        address: "",
        avatar: "",
        domain: ""
    });

    const changeContract = async(obj) => {
        if (!ensParse.address) {
            setLoading(false);
            return
        }
        await getAllNft({
            ...obj,
            ...pageConfig
        }) 
        .then(res => {
            if (res.data) {
                list = list.concat(res.data.list);
                setList([...list]);
                if (!selectContract) {
                    setTotal(res.data.total);
                }
                if (!obj.status) {
                    checkTotal = {
                        all: res.data.total,
                        open: res.data.total_public,
                        hide: res.data.total_hidden
                    }
                    setCheckTotal({...checkTotal});
                }
            }
            setLoading(false);
        })
    }

    const changeNftStatus = (id, status) => {
        modifyNftStatus({ID: id, status: status})
        .then(res => {
            if (res) {
                getInitList();
            }
        })
    }

    const io = new IntersectionObserver(ioes => {
        ioes.forEach(async(ioe) => {
            const el = ioe.target
            const intersectionRatio = ioe.intersectionRatio
            if (intersectionRatio > 0 && intersectionRatio <= 1) {
                pageConfig.page += 1;
                setPageConfig({...pageConfig});
                await changeContract({
                    address: ensParse.address,
                    contract_id: selectContract,
                    status: selectStatus
                })
                io.unobserve(el)
            }
            if (pageConfig.page * pageConfig.pageSize < checkTotal.all) {
                isInViewPortOfThree()
            }
        })
    })

    // 执行交叉观察器
    async function isInViewPortOfThree () {
        const contracts = await getContracts({address: ensParse.address});
        if (!contracts || contracts.status !== 0) {
            return
        }
        nftlist = contracts.data ? contracts.data : [];
        setNftList([...nftlist]);
        io.observe(document.querySelector(".loading"))
    }

    const init = async() => {
        await new Promise((resolve, reject) => {
           getEns({address: urlAddr})
            .then(res => {
                res ? resolve(res.data) : reject()
            })
        }).then(res => {
            ensParse = res;
            setEnsParse({...ensParse});
            setIsMe(res.address === address);
            isInViewPortOfThree()
        }).catch(err => {
            setLoading(false);
            nftlist = [];
            setNftList([...nftlist]);
        })
    }

    useEffect(() => {
        init();
    },[location])
    
    const getInitList = async() => {
        list = [];
        setList([...list]);
        setLoading(true);
        pageConfig.page = 1;
        setPageConfig({...pageConfig})
        await changeContract({
            address: ensParse.address,
            contract_id: selectContract,
            status: selectStatus
        })
        ensParse.address && isInViewPortOfThree()
    }

    useUpdateEffect(() => {
        getInitList()
    },[selectStatus, selectContract])

    return (
        <div className="Cert">
            {
                <>
                <div className="Cert-sidbar">
                    <CertSearch />
                    <Divider className="divider" />
                    <CertUser ensParse={ensParse} urlAddr={urlAddr} />
                    <div className="mt50"></div>
                    <CertNfts 
                        changeContractId={setSelectContract} 
                        total={total} 
                        isMe={isMe}
                        nftlist={nftlist}
                        ensParse={ensParse}
                    />
                </div>
                <div className="Cert-content">
                    {
                        isMe &&
                        <ul>
                            <li className={!selectStatus ? "active" :"" } onClick={() => {setSelectStatus(null)}}>全部({checkTotal.all})</li>
                            <li className={selectStatus === 2 ? "active" :"" } onClick={() => {setSelectStatus(2)}}>公开({checkTotal.open})</li>
                            <li className={selectStatus === 1 ? "active" :"" } onClick={() => {setSelectStatus(1)}}>隐藏({checkTotal.hide})</li>
                        </ul>
                    }
                    <div className="nfts">
                        <div className="scroll">
                            {
                                loading ? 
                                    LoadingComponents
                                :
                                !ensParse.address ? 
                                <></>
                                :
                                <>
                                {
                                    list && 
                                    list.map(e => 
                                        <NftBox 
                                            info={e}
                                            changeNftStatus={changeNftStatus}
                                            key={e.id}
                                            isMe={isMe}
                                        />                            
                                    )
                                }
                                </>
                            }
                            {
                                pageConfig.page * pageConfig.pageSize < checkTotal.all &&
                                LoadingComponents
                            }
                        </div>
                    </div>
                    </div>
                </>
            }
        </div>
    )
}