import {
    EyeOutlined,
    EyeInvisibleOutlined,
    MoreOutlined
  } from '@ant-design/icons';
import { Dropdown } from 'antd';
import { useEffect, useState } from 'react';


export default function NftBox(props) {
    
    const { info, changeNftStatus, isMe } = props;
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
                        <EyeOutlined />取消隐藏
                        </>
                        :
                        <>
                        <EyeInvisibleOutlined />隐藏
                        </>
                    }
                </div>
          ),
        }
    ]

    return (
        <div className="nft-detail">
            <div className="img">
                <img 
                    src={
                        info.image_uri ? 
                        `${gateway}${info.image_uri}`
                        :
                        ``
                    } 
                    alt="" 
                />
            </div>
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
                            <p>隐藏</p>
                            :
                            <p>显示</p>
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