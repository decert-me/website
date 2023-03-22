import {
    EyeOutlined,
    EyeInvisibleOutlined,
    MoreOutlined
  } from '@ant-design/icons';
import { Dropdown } from 'antd';
import { useEffect, useState } from 'react';


export default function NftBox(props) {
    
    const { info } = props;
    let [gateway, setGateway] = useState(
        "https://nftscan.mypinata.cloud/ipfs/"
        // "https://dweb.link/ipfs/"
        );

    const items = [
        {
          key: '1',
          label: (
                info.status === 1 ?
                <div><EyeOutlined />取消隐藏</div>
                :
                <div><EyeInvisibleOutlined />隐藏</div>
          ),
        }
    ]

    useEffect(() => {
        console.log(info);
    },[info])

    return (
        <div className="nft-detail">
            <div className="img">
                <img src={`${gateway}${info.image_uri}`} alt="" />
            </div>
            <div className="nft-info">
                <p className="nft-title"></p>
                <div className="bottom">
                    {
                        info.status === 1 ?
                        <p>隐藏</p>
                        :
                        <p>显示</p>
                    }
                    <Dropdown
                        menu={{
                        items
                        }}
                        placement="topLeft"
                    >
                        <div className="more">
                            <MoreOutlined className="icon" />
                        </div>
                    </Dropdown>
                </div>
            </div>
        </div>
    )
}