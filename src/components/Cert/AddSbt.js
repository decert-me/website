import { Button, Divider, Input, Select, Space, Spin } from "antd";
import {
    CheckOutlined,
    SearchOutlined,
    LoadingOutlined,
    EyeOutlined,
    EyeInvisibleOutlined
} from '@ant-design/icons';
import "@/assets/styles/component-style/cert/modal-addsbt.scss"
import { useEffect, useRef, useState } from "react";
import { flagNft, getContractNfts } from "@/request/api/nft";
import { findFastestGateway } from "@/utils/LoadImg";
import { ipfsToImg } from "@/utils/IpfsToImg";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import InfiniteScroll from "../InfiniteScroll";
import CustomLoading from "../CustomLoading";
import { covertChain } from "@/utils/convert";
const { Option } = Select;

export default function AddSbt(props) {
    
    const { handleCancel, isMobile } = props;
    const scrollRef = useRef(null);
    const navigateTo = useNavigate();
    const { t } = useTranslation(["translation", "cert"]);
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
          process.env.REACT_APP_IPFS_GATEWAY
          );
  
      let [addIds, setAddIds] = useState([]);
      let [deleteIds, setDeleteIds] = useState([]);
      let [pageConfig, setPageConfig] = useState({
          page: 0, pageSize: 16, total: 0
      })

      const renderoption = (option) => {
        return (
          <Space>
            <div className="img">
                <img src={option.icon} alt="" />
            </div>
            <div className="label">
                <span>{option.label}</span>
            </div>
          </Space>
        );
      }
    
      const dropdownRender = (menu) => (
        <div className={isMobile ? "dropdownMenu" : ""}>
          <div style={{ padding: '4px 8px', fontWeight: 'bold' }}>{t("modal.add-sbt.select")}</div>
          {menu}
        </div>
      );
  
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
          let arr = type === 2 ? deleteIds : addIds;
          arr.map((e,i) => {
              if (e === id) {
                  arr.splice(i,2);
                  if (type === 2) {
                      setDeleteIds([...arr]);
                    }else{
                      setAddIds([...arr]);
                  }
                  flag = false;
              }
          })

          if (!flag) {
              return
          }
          arr.push(id);
          if (type === 2) {
              setDeleteIds([...arr]);
            }else{
              setAddIds([...arr]);
          }
      }
        
      const confirm = () => {
          setLoading(true);
          flagNft({
            chain_id: config.chainId,
            contract_address: config.address,
            hide_ids: deleteIds,
            show_ids: addIds
          }).then(res => {
            setLoading(false);
            handleCancel && handleCancel()
            setTimeout(() => {
            navigateTo(0);
            }, 500);
          }).catch(err => {
            setLoading(false);
          })
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
  
    //   修改链或修改合约地址
    const getList = async() => {
        setisLoading(true);
        pageConfig.page += 1;
        setPageConfig({...pageConfig})
  
        getContractNfts({...config, ...pageConfig})
        .then(res => {
            if (res?.data) {
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
            }
            setisLoading(false);
        })
        .catch(err => {
            console.log(err);
            setisLoading(false);
        })
    }

    function EyeStatus({cacheStatus, id}) {
        // 判断当前id是否存在操作cache
        const isAdd = addIds.some(e => e === id);
        const isDel = deleteIds.some(e => e === id);
        let isHide = cacheStatus === 1; //  true 隐藏 : false 显示
        if (isAdd) {
            isHide = false;
        }else if (isDel) {
            isHide = true;
        }
        return isHide
    }

    useEffect(() => {
        list = [];
        cache = [];
        setList([...list]);
        setCache([...cache]);
        pageConfig = {
            page: 0, pageSize: 16, total: 0
        };
        setPageConfig({...pageConfig});
        if (config.address) {
          getList();
        }
    },[config])
  
    useEffect(() => {
        // options初始化
        options = covertChain();
        setOptions([...options]);
    },[])

    return (
        <>
            <p className="title">{t("modal.add-sbt.title")}</p>
            <div className="search">
                <div className="inner">
                    {
                        options &&
                        <Select
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
                            placeholder={t("modal.add-sbt.rule")}
                            bordered={false}
                            disabled={loading}
                            onChange={(e) => changeConfig(e.target.value.trim(), 'address')}
                        />
                        <div className="icon">
                            <SearchOutlined />
                        </div>
                    </div>
                </div>
            </div>
            <div className="content custom-scroll" ref={scrollRef} >
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
                            <>
                            {
                            list &&
                            list.map((e,i) => 
                                <div 
                                    className={`box ${cache[i].flag === 2 ? "box-active" : ""}`}
                                    key={e.id}
                                >
                                    {ipfsToImg(e)}
                                    <p>{e.name}</p>
                                    {/* <div className="checkbox">
                                        {
                                            cache[i].flag === 2 &&
                                            <CheckOutlined />
                                        }
                                    </div> */}
                                    <div 
                                        className={`badge ${EyeStatus({
                                            cacheStatus: cache[i].status, 
                                            id: e.id
                                        }) ? "show" : ""}`}
                                        onClick={() => checked(e.id, e.status, e)}
                                    >
                                        {
                                            EyeStatus({
                                                cacheStatus: cache[i].status, 
                                                id: e.id
                                            }) ? <EyeInvisibleOutlined /> : <EyeOutlined />
                                        }
                                    </div>
                                </div>    
                            )
                            }
                            {
                                pageConfig.page * pageConfig.pageSize < pageConfig.total &&
                                <InfiniteScroll 
                                    className="sbt-loading"
                                    func={getList}
                                    isCustom={true}
                                    scrollRef={scrollRef}
                                    components={(
                                        <CustomLoading className="sbt-loading" />
                                    )}
                                />
                            }
                            </>
                        )
                    }
                </div>
            </div>
            <Button 
                loading={loading}
                id="hover-btn-line"
                className="confirm" 
                onClick={() => confirm()} 
                // disabled={addIds.length === 0 && deleteIds.length === 0} 
            >{t("btn-confirm")}</Button>
        </>
    )
}