import {
    EyeOutlined,
    EyeInvisibleOutlined
  } from '@ant-design/icons';


export default function NftBox(props) {
    
    const { info } = props;

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

    return (
        <div className="nft-detail">
            <div className="img"></div>
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