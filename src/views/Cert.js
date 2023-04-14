import { Divider, Spin } from "antd";
import {
    LoadingOutlined
} from '@ant-design/icons';
import { useContext, useEffect, useState } from "react";
import "@/assets/styles/view-style/cert.scss"
import "@/assets/styles/mobile/view-style/cert.scss"
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "react-router-dom";
import { CertSearch, CertUser, CertNfts, NftBox } from "@/components/Cert";
import { getAllNft, getContracts, modifyNftStatus } from "@/request/api/nft";
import { useUpdateEffect } from "ahooks";
import { useAccount } from "wagmi";
import { useAccountInit } from "@/hooks/useAccountInit";
import MyContext from "@/provider/context";


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

    let [isList, setIsList] = useState(true);
    const { isMobile } = useContext(MyContext);
    let [isMe, setIsMe] = useState();
    let [accountAddr, setAddr] = useState();
    let [accountEns, setEns] = useState();
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
    const { status, addr, ens, refetch: accountInit } = useAccountInit({
        address: accountAddr,
        ensAddr: accountEns
    })

    const changeContract = async(obj) => {
        if (status === 'error' || !addr) {
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

    const init = () => {
        if (urlAddr.length !== 42) {
            // ENS
            accountEns = urlAddr;
            setEns(accountEns);
        }else{
            // ADDR
            accountAddr = urlAddr;
            setAddr(accountAddr);
            setIsMe(address === urlAddr);
        }
    }

    const change = async() => {
        pageConfig.page += 1;
        setPageConfig({...pageConfig});
        await changeContract({
            address: addr,
            contract_id: selectContract,
            status: selectStatus
        })
    }

    const io = new IntersectionObserver(ioes => {
        ioes.forEach(async(ioe) => {
            const el = ioe.target
            const intersectionRatio = ioe.intersectionRatio
            if (intersectionRatio > 0 && intersectionRatio <= 1) {
                change()
                io.unobserve(el)
            }
            if (pageConfig.page * pageConfig.pageSize < checkTotal.all) {
                isInViewPortOfThree()
            }
        })
    })

    async function beforeView(params) {
        const contracts = await getContracts({address: params? params : accountAddr});
        if (!contracts || contracts.status !== 0) {
            return
        }
        isMobile && await change()
        nftlist = contracts.data ? contracts.data : [];
        setNftList([...nftlist]);
    }

    async function initView() {
        await beforeView()
        isInViewPortOfThree(addr ? addr : accountAddr)
    }

    // 执行交叉观察器
    function isInViewPortOfThree (params) {
        io.observe(document.querySelector(".loading"))
    }

    function changeContractId(params) {
        setSelectContract(params);
        if (isMobile) {
            window.scrollTo(0, 0);
            setIsList(false);
        }
    }

    function goback(params) {
        window.scrollTo(0, 0);
        setIsList(true);
        setSelectContract(null);
    }

    useEffect(() => {
        if (status === 'idle') {
            accountInit()
        }else if (status === 'success') {
            setAddr(addr ? addr : accountAddr);
            setEns(ens ? ens : accountEns);
            initView()
        }
    },[status])

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
            address: accountAddr,
            contract_id: selectContract,
            status: selectStatus
        })
        if (status === "success") {
            isInViewPortOfThree()
        }
    }

    useUpdateEffect(() => {
        getInitList()
    },[selectStatus, selectContract])

    return (
        <div className="Cert">
            {
                status === "success" || status === "error" ?
                <>
                <div className={`Cert-sidbar ${isList ? "" : "none"}`}>
                    <CertSearch />
                    <Divider className="divider"  />
                    {
                        accountAddr && 
                        <CertUser 
                            account={accountAddr} 
                            ensName={accountEns} 
                            status={status} 
                        />
                    }
                    <div className="mt50"></div>
                    <CertNfts 
                        account={accountAddr} 
                        changeContractId={changeContractId} 
                        total={total} 
                        isMe={isMe}
                        status={status}
                        nftlist={nftlist}
                        isMobile={isMobile}
                    />
                </div>
                <div className={`Cert-content ${isList ? "none" : ""}`}>
                    {
                        isMobile && <div className="back" onClick={() => goback()}>back</div>
                    }
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
                                loading && status !== "error" ? 
                                LoadingComponents
                                :
                                status === "error" ? 
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
                :
                <Spin
                    size="large"
                    style={{
                        textAlign: "center",
                        margin: "200px auto 0"
                    }} 
                />
            }
        </div>
    )
}