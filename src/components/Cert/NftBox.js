import { ipfsToImg } from '@/utils/IpfsToImg';
import {
    EyeOutlined,
    EyeInvisibleOutlined,
    MoreOutlined
  } from '@ant-design/icons';
import { Dropdown } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';


export default function NftBox(props) {
    
    const { info, changeNftStatus, isMe, options } = props;
    const { t } = useTranslation(["cert"]);
    let [gateway, setGateway] = useState(
        process.env.REACT_APP_IPFS_GATEWAY
        );

    const items = [
        {
          key: '1',
          label: (
                // <div onClick={() => changeNftStatus(info.id, info.status === 1 ? 2 : 1)}><EyeOutlined />取消隐藏</div>
                // :
                // <div><EyeInvisibleOutlined />隐藏</div>
                <div onClick={() => changeNftStatus(info.id, info.status === 1 ? 2 : 1)}>
                    {
                        info.status === 1 ?
                        <>
                        <EyeOutlined />&nbsp;{t("sidbar.list.unhide")}
                        </>
                        :
                        <>
                        <EyeInvisibleOutlined />&nbsp;{t("sidbar.list.hide")}
                        </>
                    }
                </div>
          ),
        }
    ]

    return (
        <div className="nft-detail">
            {
                options.map(item => {
                    if (item.label.toLocaleLowerCase() === info.chain) {
                        return (
                            <div className={info.status === 1 ? "show" : ""}>
                                <div className="badge badge-chain">
                                    <a href={`${item.link}${info.contract_address}`} target="_blank">
                                        <img src={item.icon} alt="" key={item.value} />
                                    </a>
                                </div>
                                <div className="badge badge-opensea">
                                    <a href={`https://opensea.io/assets/${item?.alias ? item?.alias : item?.label}/${info.contract_address}/${info.token_id}`} target="_blank">
                                        <img src={require("@/assets/images/icon/opensea.png")} alt="" />
                                    </a>
                                </div>
                                <div className={`badge badge-eye ${info.status === 1 ? "eye-hide" : "eye-show"}`}>
                                    {
                                        info.status === 1 ?
                                        <EyeInvisibleOutlined />:
                                        <EyeOutlined />
                                    }
                                </div>
                            </div>
                        )
                    }
                })
            }
            
            
            {ipfsToImg(info)}
            <div className="nft-info">
                <p className="nft-title newline-omitted">
                    {
                        info.name ? 
                        info.name
                        :
                        '#'+info.token_id
                    }
                </p>
                {
                    isMe &&
                    <div className="bottom">
                        {
                            info.status === 1 ?
                            <p>{t("sidbar.list.hide")}</p>
                            :
                            <p>{t("sidbar.list.public")}</p>
                        }
                        <Dropdown
                            className='dropdown'
                            menu={{
                            items
                            }}
                            placement="topLeft"
                            trigger={['click']}
                        >
                            <div className="more">
                                <MoreOutlined className="icon" />
                            </div>
                        </Dropdown>
                    </div>
                }
            </div>
        </div>
    )
}