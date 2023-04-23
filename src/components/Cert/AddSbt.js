import { Button, Divider, Input, Select, Space, Spin } from "antd";
import {
    CheckOutlined,
    SearchOutlined,
    LoadingOutlined
} from '@ant-design/icons';
import "@/assets/styles/component-style/cert/modal-addsbt.scss"
import { useEffect, useRef, useState } from "react";
import { constans } from "@/utils/constans";
import { flagNft, getContractNfts } from "@/request/api/nft";
import { findFastestGateway } from "@/utils/LoadImg";
import { ipfsToImg } from "@/utils/IpfsToImg";
import { useRequest, useUpdateEffect } from "ahooks";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
const { Option } = Select;

export default function AddSbt(props) {
    
    const { handleCancel, isMobile } = props;
    const scrollRef = useRef(null);
    const { chains } = constans();
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
          "https://nftscan.mypinata.cloud/ipfs/"
          // "https://dweb.link/ipfs/"
          );
  
      let [addIds, setAddIds] = useState([]);
      let [deleteIds, setDeleteIds] = useState([]);
      let [pageConfig, setPageConfig] = useState({
          page: 0, pageSize: 16, total: 0
      })

      const renderoption = (option) => {
        return (
          <Space>
            <div className="img" style={{width: "20px", height: "20px"}}>
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
              handleCancel()
              setTimeout(() => {
                navigateTo(0);
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
    const { runAsync } = useRequest(getList, {
        debounceWait: 300,
        manual: true
    });

    function handleScroll() {
        const { scrollTop, clientHeight, scrollHeight } = scrollRef.current;
        const isLoading = document.querySelector(".search .loading");
        if ((scrollTop + clientHeight >= (scrollHeight - 130)) && isLoading) {
            runAsync();
        }
    };
  
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
            runAsync();
          }
      },[config])
  
      useEffect(() => {
          init();
      },[])

    useEffect(() => {
        scrollRef.current?.addEventListener('scroll', handleScroll);
      return () => {
          scrollRef.current?.removeEventListener('scroll', handleScroll);
      };
  }, []);

    return (
        <>
            <p className="title">{t("modal.add-sbt.title")}</p>
            <div className="search">
                <div className="inner">
                    {
                        options &&
                        <Select
                            style={{ width: isMobile ? 110 : 180 }}
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

                <Button 
                    loading={loading}
                    className="confirm" 
                    onClick={() => confirm()} 
                    disabled={addIds.length === 0 && deleteIds.length === 0} 
                >{t("btn-confirm")}</Button>
            </div>
            <Divider style={{marginBlock: "30px"}} />
            <div className="content" ref={scrollRef} >
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
                                    onClick={() => checked(e.id,e.flag)}
                                >
                                    {ipfsToImg(e)}
                                    <p>{e.name}</p>
                                    <div className="checkbox">
                                        {
                                            cache[i].flag === 2 &&
                                            <CheckOutlined />
                                        }
                                    </div>
                                </div>    
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
                                    <p>{t("status.load")}...</p>
                                </div>
                            }
                            </>
                        )
                    }
                </div>
            </div>
        </>
    )
}