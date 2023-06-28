import { ipfsToImg } from '@/utils/IpfsToImg';
import {
    EyeOutlined,
    EyeInvisibleOutlined,
    MoreOutlined
  } from '@ant-design/icons';
import { Dropdown, Tooltip } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';


export default function NftBox(props) {
    
    const { info, changeNftStatus, isMe, options } = props;
    const { t } = useTranslation(["cert"]);
    let [gateway, setGateway] = useState(
        process.env.REACT_APP_IPFS_GATEWAY
        );

    return (
        <div className="nft-detail">
            {
                options.map((item, index) => {
                    if (item.label.toLocaleLowerCase() === info.chain) {
                        return (
                            <div key={index} className={info.status === 1 ? "show" : ""}>
                                <div className="badge badge-chain">
                                    <a href={`${item.link}${info.contract_address}`} target="_blank">
                                        <img src={item.icon} alt="" key={item.value} />
                                    </a>
                                </div>
                                {
                                    item.label !== "Gnosis" && 
                                    <div className="badge badge-opensea">
                                        <a href={`https://opensea.io/assets/${item?.alias ? item?.alias : item?.label}/${info.contract_address}/${info.token_id}`} target="_blank">
                                            <img src={require("@/assets/images/icon/opensea.png")} alt="" />
                                        </a>
                                    </div>
                                }
                                {
                                    isMe &&
                                    <Tooltip
                                            title={
                                                info.status === 1 ? t("cert:sidbar.list.hide") : t("cert:sidbar.list.public")
                                            }
                                        >
                                    <div 
                                        className={`badge badge-eye ${info.status === 1 ? "eye-hide" : "eye-show"}`}
                                        onClick={() => changeNftStatus(info.id, info.status === 1 ? 2 : 1)}
                                    >
                                        {
                                            info.status === 1 ?
                                            <EyeInvisibleOutlined />:
                                            <EyeOutlined />
                                        }
                                    </div>
                                    </Tooltip>
                                }
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
            </div>
        </div>
    )
}