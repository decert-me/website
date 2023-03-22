import { Button, Divider, Input, Modal, Select, Skeleton, Space } from "antd";
import {
    CloseCircleOutlined,
    QuestionOutlined,
    SearchOutlined
} from '@ant-design/icons';
import "@/assets/styles/component-style/cert/modal-addsbt.scss"
import { useEffect, useState } from "react";
import { constans } from "@/utils/constans";
import { flagNft, getContractNfts } from "@/request/api/nft";
import { findFastestGateway } from "@/utils/LoadImg";
const { Option } = Select;

const renderoption = (option) => {
    return (
      <Space>
        {/* <Icon type={option.icon} /> */}
        <div className="img" style={{width: "20px", height: "20px"}}>
        <img src={option.icon} alt="" />

        </div>
        {/* <QuestionOutlined /> */}
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
    const { chains } = constans();
    let [options, setOptions] = useState();
    let [config, setConfig] = useState({
        chainId: 137, address: "", page: 1, pageSize: 10
    })
    let [list, setList] = useState();
    let [gateway, setGateway] = useState(
        "https://nftscan.mypinata.cloud/ipfs/"
        // "https://dweb.link/ipfs/"
        );

    let [addIds, setAddIds] = useState([]);
    let [deleteIds, setDeleteIds] = useState([]);

    const checked = (id, arr) => {
        let flag = true;
        arr.map((e,i) => {
            if (e === id) {
                arr.splice(i,1);
                setAddIds([...addIds]);
                setDeleteIds([...deleteIds]);
                flag = false;
            }
        })
        if (!flag) {
            return
        }
        arr.push(id);
        setAddIds([...addIds]);
        setDeleteIds([...deleteIds]);
        // setIds([...arr]);
    }

    const confirm = () => {

        if (addIds.length > 0) {
            flagNft({
                ids: addIds,
                flag: 2
            })
            .then(res => {
                console.log(res);
            })
        }
        if (deleteIds.length > 0) {
            flagNft({
                ids: deleteIds,
                flag: 1
            })
            .then(res => {
                console.log(res);
            })
        }
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

    useEffect(() => {
        if (config.address.length === 42) {
            getContractNfts(config)
            .then(res => {
                if (res.data) {
                    list = res.data?.list ? res.data?.list : [];
                    setList([...list]);
                }
            })
        }
    },[config])

    useEffect(() => {
        init();
    },[])

    return (
        <Modal
            className="ModalAddSbt"
            footer={null}
            open={isModalOpen}
            onCancel={handleCancel}
            afterClose={() => {setList([...[]])}}
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
                    className="confirm" 
                    onClick={() => confirm()} 
                    disabled={addIds.length === 0 && deleteIds.length === 0} 
                >确认</Button>
            </div>
            <Divider style={{marginBlock: "30px"}} />
            <div className="content">
                {
                    list &&
                    list.map(e => 
                        <div 
                            className="box" 
                            key={e.id}
                            onClick={() => checked(e.id,e.flag === 1 ? addIds : deleteIds)}
                        >
                            {/* <Skeleton.Image active /> */}
                            <div className="img">
                                <img src={`${gateway}${e.image_uri}`} alt="" />
                            </div>
                            <p>{e.name}</p>
                        </div>    
                    )
                }
            </div>
        </Modal>
    )
}