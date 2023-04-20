import { Button, Divider, Spin } from "antd";
import {
    LoadingOutlined,
    LeftOutlined
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
import MyContext from "@/provider/context";
import AddSbt from "@/components/Cert/AddSbt";
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

    let [isList, setIsList] = useState(true);
    const { isMobile } = useContext(MyContext);
    let [isMe, setIsMe] = useState();
    let [list, setList] = useState([]);
    let [nftlist, setNftList] = useState();
    let [total, setTotal] = useState();
    let [addSbtPanel, setAddSbtPanel] = useState();
    
    let [checkTotal, setCheckTotal] = useState({
        all: 0, open: 0, hide: 0
    });
    let [pageConfig, setPageConfig] = useState({
        page: 0, pageSize: 12
    })
    let [loading, setLoading] = useState(true);
    let [selectStatus, setSelectStatus] = useState();
    let [selectContract, setSelectContract] = useState();
    let [isRequest, setIsRequest] = useState(false);
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
        setIsRequest(false);
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
            if (intersectionRatio > 0 && intersectionRatio <= 1 && !isRequest) {
                setIsRequest(true);
                pageConfig.page += 1;
                setPageConfig({...pageConfig});
                console.log('执行 =-==>');
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
        io.observe(document.querySelector(".loading"))
    }

    async function beforeIo(params) {
        const contracts = await getContracts({address: ensParse.address});
        if (!contracts || contracts.status !== 0) {
            return
        }
        nftlist = contracts.data ? contracts.data : [];
        setNftList([...nftlist]);

        isInViewPortOfThree();
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
            beforeIo()
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
        if (isRequest) {
            return
        }
        setIsRequest(true);
        list = [];
        setList([...list]);
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
    
    const goAddSbt = () => {
        setAddSbtPanel(true);
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

    function checkNum() {
        let num;
        switch (selectStatus) {
            case null:
                num = checkTotal.all
                break;
            case 2:
                num = checkTotal.open
                break;
            case 1:
                num = checkTotal.hide
                break;
            default:
                break;
        }
        return num
    }

    return (
        <div className="Cert">
            {
                <>
                <div className={`Cert-sidbar ${isList ? "" : "none"} ${addSbtPanel ? "none" : ""}`}>
                    <CertSearch />
                    <Divider className="divider"  />
                    <CertUser ensParse={ensParse} urlAddr={urlAddr} />
                    <div className="mt50"></div>
                    <CertNfts 
                        ensParse={ensParse}
                        changeContractId={changeContractId} 
                        total={total} 
                        isMe={isMe}
                        nftlist={nftlist}
                        isMobile={isMobile}
                        goAddSbt={goAddSbt}
                    />
                </div>
                <div className={`Cert-content ${isList ? "none" : ""} ${addSbtPanel ? "none" : ""}`}>
                    {
                        isMobile && 
                        <div className="back" onClick={() => goback()}>
                            <LeftOutlined />
                        </div>
                    }
                    {
                        isMe &&
                        <ul>
                            <li className={!selectStatus ? "active" :"" } onClick={() => {setSelectStatus(null)}}>全部&nbsp;({checkTotal.all})</li>
                            <li className={selectStatus === 2 ? "active" :"" } onClick={() => {setSelectStatus(2)}}>公开&nbsp;({checkTotal.open})</li>
                            <li className={selectStatus === 1 ? "active" :"" } onClick={() => {setSelectStatus(1)}}>隐藏&nbsp;({checkTotal.hide})</li>
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
                                {
                                    pageConfig.page * pageConfig.pageSize < (!selectStatus ? checkTotal.all : selectStatus === 2 ? checkTotal.open : checkTotal.hide) ?
                                    LoadingComponents
                                    :
                                    <></>
                                }
                                </>
                            }
                        </div>
                    </div>
                </div>
                <div className={`Cert-addsbt ${addSbtPanel ? "" : "none"}`}>
                    {
                        isMobile && 
                        <>
                        <div className="back">
                            <div className="icon" onClick={() => {setAddSbtPanel(false)}}>
                                <LeftOutlined />
                            </div>
                        </div>
                        <AddSbt isMobile={isMobile} />
                        </>
                    }
                </div>
                </>
                // :
                // <Spin
                //     size="large"
                //     style={{
                //         textAlign: "center",
                //         margin: "200px auto 0"
                //     }} 
                // />
            }
        </div>
    )
}