import { Button, Divider } from "antd";
import {
    LeftOutlined
} from '@ant-design/icons';
import { useContext, useEffect, useRef, useState } from "react";
import "@/assets/styles/view-style/cert.scss"
import "@/assets/styles/mobile/view-style/cert.scss"
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "react-router-dom";
import { CertSearch, CertUser, CertNfts, NftBox, ModalAddSbt } from "@/components/Cert";
import { getAllNft, getContracts, getEns, modifyNftStatus, reloadSbt } from "@/request/api/nft";
import { useUpdateEffect } from "ahooks";
import { useAccount } from "wagmi";
import MyContext from "@/provider/context";
import AddSbt from "@/components/Cert/AddSbt";
import store, { hideCustomSigner, showCustomSigner } from "@/redux/store";
import CustomLoading from "@/components/CustomLoading";
import InfiniteScroll from "@/components/InfiniteScroll";
import { covertChain } from "@/utils/convert";

export default function Cert(params) {
    
    const { t } = useTranslation(["cert"]);
    const location = useLocation();
    const { address: urlAddr } = useParams();
    const { address } = useAccount();
    const { isMobile } = useContext(MyContext);

    const [isModalOpen, setIsModalOpen] = useState(false);
    let [isList, setIsList] = useState(true);
    let [isMe, setIsMe] = useState();
    let [list, setList] = useState([]);
    let [nftlist, setNftList] = useState();
    let [total, setTotal] = useState();
    let [addSbtPanel, setAddSbtPanel] = useState();
    let [options, setOptions] = useState();     //  chains

    
    let [checkTotal, setCheckTotal] = useState({
        all: 0, open: 0, hide: 0
    });
    let [pageConfig, setPageConfig] = useState({
        page: 0, pageSize: 12
    })
    const scrollRef = useRef(null);
    let [loading, setLoading] = useState(true);
    let [reloading, setReloading] = useState(false);
    
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
                if (obj.contract_id) {
                    nftlist.map(e => {
                        if (e.id === obj.contract_id) {
                            e.count = isMe ? res.data.total : res.data.total_public;
                        }
                    })
                    setNftList([...nftlist]);
                }
                list = list.concat(res.data.list);
                setList([...list]);
                checkTotal = {
                    all: res.data.total,
                    open: res.data.total_public,
                    hide: res.data.total_hidden
                }
                setCheckTotal({...checkTotal});
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



    async function initContracts(params) {
        // 运行一次 ==>
        const contracts = await getContracts({address: ensParse.address});
        if (!contracts || contracts.status !== 0) {
            return
        }
        nftlist = contracts.data ? contracts.data : [];
        setNftList([...nftlist]);

        let num = 0
        nftlist.map(e => {
            if (e?.count) {
                num+=e.count
            }
        })
        setTotal(num);
        getNfts()
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
            initContracts();
            setIsMe(ensParse.address === address);
        }).catch(err => {
            setLoading(false);
            nftlist = [];
            setNftList([...nftlist]);
        })
    }
 
    // 切换条件
    const getInitList = async() => {
        list = [];
        setList([...list]);
        pageConfig = {
            page: 1, pageSize: 12
        };
        setPageConfig({...pageConfig})
        await changeContract({
            address: ensParse.address,
            contract_id: selectContract,
            status: selectStatus
        })
    }
   
    const goAddSbt = () => {
        // if (isMobile) {
        //     setAddSbtPanel(true)
        //     return
        // }
        setIsModalOpen(true);
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

    // 获取列表
    async function getNfts(params) {
        pageConfig.page += 1;
        setPageConfig({...pageConfig});
        await changeContract({
            address: ensParse.address,
            contract_id: selectContract,
            status: selectStatus
        })
    }

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    async function goReload(params) {
        setReloading(true);
        await reloadSbt({address: urlAddr})
        setReloading(false);
        // 刷新当前页面
        window.location.reload();
    }

    const Reload = (
        <Button 
            className="reload" 
            onClick={() => goReload()}
            loading={reloading}
            icon={
                <img 
                    src={require("@/assets/images/icon/reload.png")} 
                    alt="" 
                />
            }
        >
            {t("reload")}
        </Button>
    )

    useEffect(() => {
        options = covertChain();
        setOptions([...options]);
        init();
    },[location])

    useUpdateEffect(() => {
        getInitList()
    },[selectStatus, selectContract])
   
    // useUpdateEffect(() => {
    //     setIsMe(ensParse.address === address);
    // },[ensParse, address])

    return (
        <div className="Cert">
            <div className="header-line" />
            {
                ensParse.address &&
                <ModalAddSbt
                    isModalOpen={isModalOpen} 
                    handleCancel={handleCancel}
                    isMobile={isMobile}
                />
            }
            <div className={`Cert-sidbar ${!isList || addSbtPanel ? "none" : ""}`}>
                <CertSearch />
                <CertUser ensParse={ensParse} urlAddr={urlAddr} />
                <Divider className="line" />
                <CertNfts 
                    changeContractId={changeContractId} 
                    total={total} 
                    isMe={isMe}
                    nftlist={nftlist}
                    isMobile={isMobile}
                    goAddSbt={goAddSbt}
                    options={options}
                />
            </div>
            <div className={`Cert-content ${isList || addSbtPanel ? "none" : ""}`}>
                {
                    isMobile && 
                    <div className="content-header-mobile">
                        <div className="back" onClick={() => goback()}>
                            <LeftOutlined />
                        </div>
                        {Reload}
                    </div>
                }
                <div className="content-header">
                    {
                        isMe ?
                        <ul>
                            <li className={!selectStatus ? "active" :"" } onClick={() => {setSelectStatus(null)}}>{t("cert:sidbar.list.all")}&nbsp;({checkTotal.all})</li>
                            <li className={selectStatus === 2 ? "active" :"" } onClick={() => {setSelectStatus(2)}}>{t("cert:sidbar.list.public")}&nbsp;({checkTotal.open})</li>
                            <li className={selectStatus === 1 ? "active" :"" } onClick={() => {setSelectStatus(1)}}>{t("cert:sidbar.list.hide")}&nbsp;({checkTotal.hide})</li>
                        </ul>
                        :
                        <div></div>
                    }
                    {
                        !isMobile && Reload
                    }
                </div>
                <div className="nfts" ref={scrollRef}>
                    <div className="scroll">
                        {
                            loading ?
                            <CustomLoading />
                            :
                            !ensParse.address ? 
                            <></>
                            :
                            <>
                            {
                                list && <>
                                    {
                                        list.map(e => 
                                            <NftBox 
                                                info={e}
                                                changeNftStatus={changeNftStatus}
                                                key={e.id}
                                                isMe={isMe}
                                                options={options}
                                            />                            
                                        )
                                    }
                                </>
                            }
                            {
                                list.length === 0 &&
                                <div className="nodata">
                                    <p>{t("cert:sidbar.nodata")}</p>
                                    {
                                        isMe && 
                                        <Button onClick={goAddSbt} id="hover-btn-line">
                                            {t("cert:sidbar.list.add")}
                                        </Button>
                                    }
                                </div>
                            }
                            {
                                pageConfig.page * pageConfig.pageSize < (!selectStatus ? checkTotal.all : selectStatus === 2 ? checkTotal.open : checkTotal.hide) &&
                                
                                <InfiniteScroll
                                    func={getNfts}
                                    isCustom={true}
                                    scrollRef={scrollRef}
                                    components={(
                                        <CustomLoading />
                                    )}
                                />
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
        </div>
    )
}