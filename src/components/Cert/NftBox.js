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
    
    const { info, changeNftStatus, isMe } = props;
    const { t } = useTranslation(["cert"]);
    let [gateway, setGateway] = useState(
        "https://nftscan.mypinata.cloud/ipfs/"
        // "https://dweb.link/ipfs/"
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
            {ipfsToImg(info)}
            <div className="nft-info">
                <p className="nft-title">
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