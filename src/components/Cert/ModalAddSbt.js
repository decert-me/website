import { Button, Divider, Input, message, Modal, Select, Space, Spin } from "antd";
import {
    CloseCircleOutlined,
    CheckOutlined,
    SearchOutlined,
    LoadingOutlined
} from '@ant-design/icons';
import "@/assets/styles/component-style/cert/modal-addsbt.scss"
import { useEffect, useState } from "react";
import { constans } from "@/utils/constans";
import { flagNft, getContractNfts } from "@/request/api/nft";
import { findFastestGateway } from "@/utils/LoadImg";
import { ipfsToImg } from "@/utils/IpfsToImg";
import { useNavigate } from "react-router-dom";
import { useUpdateEffect } from "ahooks";
const { Option } = Select;

const renderoption = (option) => {
    return (
      <Space>
        <div className="img" style={{width: "20px", height: "20px"}}>
        <img src={option.icon} alt="" />

        </div>
        <span>{option.label}</span>
      </Space>
    );
  }

  const dropdownRender = (menu) => (
    <div>
      <div style={{ padding: '4px 8px', fontWeight: 'bold' }}>Select Chain ID</div>
      {menu}
    </div>
  );
  

export default function ModalAddSbt(props) {
    
    const { isModalOpen, handleCancel } = props;
    const navigateTo = useNavigate();
    const { chains } = constans();
    let [options, setOptions] = useState();
    let [loading, setLoading] = useState();
    let [isLoading, setisLoading] = useState(false);
    let [config, setConfig] = useState({
        // chainId: 137, address: "", page: 1, pageSize: 10
        chainId: 137, address: ""
    })
    let [list, setList] = useState([]);
    let [cache, setCache] = useState([]);
    let [gateway, setGateway] = useState(
        "https://nftscan.mypinata.cloud/ipfs/"
        // "https://dweb.link/ipfs/"
        );

    let [addIds, setAddIds] = useState([]);
    let [deleteIds, setDeleteIds] = useState([]);
    let [pageConfig, setPageConfig] = useState({
        page: 0, pageSize: 16, total: 0
    })

    const changeList = (id) => {
        cache.map(e => {
            if (e.id === id) {
                e.flag = e.flag === 1 ? 2 : 1;
            }
        })
        setCache([...cache]);
    }

    const checked = (id, type) => {
        changeList(id);
        let flag = true;
        let arr = type === 1 ? addIds : deleteIds;
        arr.map((e,i) => {
            if (e === id) {
                arr.splice(i,1);
                if (type === 1) {
                    setAddIds([...arr]);
                }else{
                    setDeleteIds([...arr]);
                }
                flag = false;
            }
        })
        if (!flag) {
            return
        }
        arr.push(id);
        if (type === 1) {
            setAddIds([...arr]);
        }else{
            setDeleteIds([...arr]);
        }
    }

    const addNft = () => {
        new Promise((resolve, reject) => {
            if (addIds.length > 0) {
                flagNft({
                    ids: addIds,
                    flag: 2
                })
                .then(res => {
                    resolve();
                })
            }else{
                resolve();
            }
        });
    }
      
    const reduceNft = () => {
        new Promise((resolve, reject) => {
            if (deleteIds.length > 0) {
                flagNft({
                    ids: deleteIds,
                    flag: 1
                })
                .then(res => {
                    resolve();
                })
            }else{
                resolve();
            }
        });
    }

    const confirm = () => {
        setLoading(true);
        const promise1 = addNft();
        const promise2 = reduceNft();
        Promise.all([promise1, promise2])
        .then(results => {
            // 处理结果
            setLoading(false);
            message.success('操作成功')
            setTimeout(() => {
                handleCancel()
            }, 500);
        })
        .catch(error => {
            setLoading(false);
            // 处理错误
        });
    }

    const changeConfig = (v, key) => {
        config[key] = v;
        setConfig({...config});
    }

    const selectGateway = () => {
        findFastestGateway()
        .then(res => {
            if (res) {
                gateway = res;
                setGateway(gateway);
            }
        })
        .catch(err => {
            console.log('err ==>',err);
        })
    }

    const init = () => {
        let arr = [];
        for (const i in chains) {
            arr.push({
                value: Number(i), label: chains[i].name, icon: chains[i].icon 
            })
        }
        options = arr;
        setOptions([...options]);
    }

    const getList = async() => {
        setisLoading(true);
        pageConfig.page += 1;
        setPageConfig({...pageConfig})

        await getContractNfts({...config, ...pageConfig})
        .then(res => {
            if (res.data) {
                pageConfig = {
                    page: res.data.page,
                    pageSize: res.data.pageSize,
                    total: res.data.total
                }
                setPageConfig({...pageConfig})
                let arr = res.data?.list ? res.data?.list : [];
                list = list.concat(arr.slice());
                setList([...list]);
                cache = cache.concat(JSON.parse(JSON.stringify(arr)));
                setCache([...cache]);
                setisLoading(false);
            }
        })
    }

    const io = new IntersectionObserver(ioes => {
        ioes.forEach(async(ioe) => {
            const el = ioe.target
            const intersectionRatio = ioe.intersectionRatio
            if (intersectionRatio > 0 && intersectionRatio <= 1) {
                await getList()
                io.unobserve(el)
            }
        })
    })

    // 执行交叉观察器
    function isInViewPortOfThree () {
        io.observe(document.querySelector(".loading"))
    }

    useEffect(() => {
        if (config.address.length === 42) {
            getList();
        }
    },[config])

    useEffect(() => {
        init();
    },[])

    useUpdateEffect(() => {
        if (pageConfig.page !== 0 && list.length !== pageConfig.total) {
            isInViewPortOfThree()
        }
    },[list])

    return (
        <Modal
            className="ModalAddSbt"
            footer={null}
            open={isModalOpen}
            onCancel={handleCancel}
            afterClose={() => {
                navigateTo(0);
            }}
            closeIcon={<CloseCircleOutlined />}
            destroyOnClose
            width="1164px"
        >
            <p className="title">请添加可作为你技能能力证明的SBT</p>
            <div className="search">
                <div className="inner">
                    {
                        options &&
                        <Select
                            style={{ width: 180 }}
                            value={config.chainId}
                            onChange={(e) => changeConfig(e, 'chainId')}
                            bordered={false}
                            dropdownRender={dropdownRender}
                        >
                            {options.map((option) => (
                                <Option key={option.value} value={option.value}>
                                {renderoption(option)}
                                </Option>
                            ))}
                        </Select>
                    }
                    <div className="input">
                        <Input 
                            placeholder="请输入合约地址" 
                            bordered={false}
                            onChange={(e) => changeConfig(e.target.value, 'address')}
                        />
                        <div className="icon">
                            <SearchOutlined />
                        </div>
                    </div>
                </div>

                <Button 
                    loading={loading}
                    className="confirm" 
                    onClick={() => confirm()} 
                    disabled={addIds.length === 0 && deleteIds.length === 0} 
                >确认</Button>
            </div>
            <Divider style={{marginBlock: "30px"}} />
            <div className="content">
                <div className="list-content">
                    {
                        list.length === 0 && isLoading ?
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
                        :
                        (
                            list &&
                            list.map((e,i) => 
                                <div 
                                    className={`box ${cache[i].flag === 2 ? "box-active" : ""}`}
                                    key={e.id}
                                    onClick={() => checked(e.id,e.flag)}
                                >
                                    <div className="img">
                                        <img src={ipfsToImg(e)} alt="" />
                                    </div>
                                    <p>{e.name}</p>
                                    <div className="checkbox">
                                        {
                                            cache[i].flag === 2 &&
                                            <CheckOutlined />
                                        }
                                    </div>
                                </div>    
                            )
                        )
                    }
                    {
                        pageConfig.page * pageConfig.pageSize < pageConfig.total &&
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
                    }
                </div>
            </div>
        </Modal>
    )
}