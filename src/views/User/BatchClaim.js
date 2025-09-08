import React, { useState, useEffect, useContext,useRef } from 'react';
import { Table, Button, Checkbox, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { getChallengeComplete, getClaimHash } from '@/request/api/public';
import { hasClaimed, wechatShare } from "@/request/api/public";
import { ipfsImg,getQuests } from "@/request/api/public";
import { useRequest } from "ahooks";
import { useAddress } from '@/hooks/useAddress';
import MyContext from '@/provider/context';
import { constans } from '@/utils/constans';
import './styles/batchClaim.scss';

const BatchClaim = () => {
  const { t } = useTranslation(['translation', 'profile']);
  const { address } = useAddress();
  const { user } = useContext(MyContext);
  const px = 1024;
  const maskHeight = px * 0.23;
  const textHeight = 64;
  const textPad = 60;
  const textMaxWidth = px - (textPad * 2);
  const { ipfsPath, defaultImg } = constans();
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [nftList, setNftList] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100,
    total: 0,
  });



  // 表格列定义
  const columns = [
    {
      title: 'NFT信息',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      render: (text, record) => (
        <div className="nft-info">
          <img 
            src={record.image} 
            alt={record.name} 
            className="nft-image"
            onError={(e) => {
              e.target.src = defaultImg;
            }}
          />
          <div className="nft-details">
            <div className="nft-name">{record.name}</div>
            <div className="nft-description">{record.description}</div>
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'claimable',
      key: 'claimable',
      width: 100,
      render: (claimable) => (
        <span className={`status-tag ${claimable ? 'claimable' : 'claimed'}`}>
          {claimable ? '可领取' : '已领取'}
        </span>
      ),
    },
  ];

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowKeys(selectedRowKeys);
    },
    getCheckboxProps: (record) => ({
      disabled: !record.claimable, // 不可领取的NFT禁用复选框
      name: record.name,
    }),
  };

  // 获取可领取NFT列表
  const fetchClaimableNFTs = async (page = 1, pageSize = 100) => {

    setLoading(true);
    try {
      // 调用真实的API获取可领取的挑战数据
      // type: 1 表示可领取状态，claimable: true 表示只获取可领取的
      const response = await getChallengeComplete({
        address: address,
        type: 1, // 可领取状态
        page: page,
        pageSize: pageSize,
        claimable: true
      });
      
      if (response?.data) {
        const list = response.data.list || [];
        // 转换数据格式以适配表格显示
        const formattedList = list.map((item, index) => ({
          id: item.id || `nft_${index + 1}`,
          key: item.id || `nft_${index + 1}`,
          name: item.title || `NFT Challenge ${index + 1}`,
          description: item.description || `这是第 ${index + 1} 个可领取的NFT挑战`,
          image: item.metadata?.image?.indexOf("https://") !== -1 ? 
            item.metadata.image
            :
            item.metadata?.image?.split("//")[1] ? 
            `${ipfsPath}/${item.metadata.image.split("//")[1]}` :
            item.metadata?.properties?.media?.split("//")[1]? 
            `${ipfsPath}/${item.metadata?.properties?.media.split("//")[1]}` :
            defaultImg,
          claimable: true,
          questId: item.uuid,
          tokenId: item.tokenId
        }));
        
        setNftList(formattedList);
        setPagination({
          current: page,
          pageSize,
          total: response.data.total || 0,
        });
      } else {
        setNftList([]);
        setPagination({
          current: page,
          pageSize,
          total: 0,
        });
      }
    } catch (error) {
      console.error('获取NFT列表失败:', error);
      message.error('获取NFT列表失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  async function shareWechat({chainId,image,tokenId,answers}) {
        const data = {
            tokenId: tokenId,
            score: 10000,
            answer: JSON.stringify(answers),
            chain_id: chainId,
            image_uri: "ipfs://"+image
        }
        if (answers[0]?.score) {
            data.score = answers[0].score *100
        }
        return await wechatShare(data)
        .then(res => {
            return res?.status === 0 ? res.data : null
        })
    }
    function splitWords(ctx, text) {
        // 分割
        let words = text.match(/[\u4e00-\u9fa5]|[^\u4e00-\u9fa5]|\S+/g);
        let line = '';
        let lines = [];

        for (let i = 0; i < words.length; i++) {
            let testLine = line + words[i];
            let testWidth = ctx.measureText(testLine).width;
            if (testWidth > textMaxWidth && i > 0) {
                lines.push(line.trim());
                line = words[i];
                if (lines.length == 2) {
                    // If we already have two lines, add an ellipsis to the end of the second line and break the loop
                    lines[1] = lines[1].trim() + '...';
                    break;
                }
            } else {
                line = testLine;
            }
        }
        if (lines.length < 2) {
            lines.push(line.trim());
        }

        for (var i = 0; i < lines.length; i++) {
            const lineHeight = lines.length === 2 ? textHeight : textHeight*2
            const textpd = (lineHeight - 64) / 2 + (5 * i);
            ctx.fillText(lines[i], textPad, (px * 0.88) + (i * lineHeight) + textpd);
        }
    }
    async function generate(base64, text) {
        return await new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = base64;
            img.onload = async function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas?.getContext('2d');
                // 宽高
                canvas.width = px;
                canvas.height = px;
                    
                // img
                ctx.drawImage(img, 0, 0, px, px);
                
                // mask
                let mask = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - maskHeight)
                mask.addColorStop(0, 'rgba(0, 0, 0, 1)'); // Black at the bottom
                mask.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Transparent at the top
                ctx.fillStyle = mask;
                ctx.fillRect(0, canvas.height - maskHeight, canvas.width, maskHeight);
    
                // text
                ctx.font = '64px Arial';
                ctx.fillStyle = 'white';
                splitWords(ctx, text);
    
                try {
                    // download
                    const dataUrl = canvas.toDataURL('image/png');
                    // base64转换为Blob
                    const blob = await (await fetch(dataUrl)).blob();
                    // Blob转换为file
                    const file = new File([blob], 'image.png', {type: 'image/png'});
                    const formData = new FormData();
                    formData.append('file', file);
                    await ipfsImg(formData)
                    .then(res => {
                        if (res.status === 0) {
                            resolve(res.data.hash);
                        }else{
                            reject(res.message);
                        }
                    })
                } catch (error) {
                    reject(error)
                }
            }
            img.onerror = function() {
                reject(new Error('Image load failed'));
            };
        })
        .then(res => {
            return res
        })
        .catch(err => {
            throw new Error(err)
        })
    }


  // 批量领取NFT
  const handleBatchClaim = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要领取的NFT');
      return;
    }

    if (!address) {
      message.warning('请先连接钱包');
      return;
    }

    setLoading(true);
    let successCount = 0;
    let failCount = 0;
    
    try {
      // 批量处理每个选中的NFT
      for (const nftId of selectedRowKeys) {
        console.log(nftId)
         const selectedNft = nftList.find(item => item.key === nftId);
         if (!selectedNft) {
            failCount++;
            continue;
         }
        try {
            const res = await getQuests({id: selectedNft.questId});
            const dataAnswer = res.data.answer;
            await shareWechat({chainId: 10, image:"",tokenId: selectedNft.tokenId,answers:dataAnswer});
            successCount++;
        } catch (error) {
            failCount++;
            message.error(t("message.claim-error"))
        }
      }
      
      
      // 清空选择
      setSelectedRowKeys([]);
      
      // 显示结果提示
      if (successCount > 0) {
        message.success(`成功领取 ${successCount} 个NFT`);
        // 重新获取数据
        fetchClaimableNFTs(pagination.current, pagination.pageSize);
      }
      
      if (failCount > 0 && successCount === 0) {
        message.error(`领取失败，请重试`);
      } else if (failCount > 0) {
        message.warning(`${successCount} 个成功，${failCount} 个失败`);
      }
    } catch (error) {
      console.error('批量领取过程中发生错误:', error);
      message.error('批量领取失败，请重试');
    } finally {
      setLoading(false);
    }
  };



  // 全选/取消全选
  const handleSelectAll = (checked) => {
    if (checked) {
      const claimableKeys = nftList
        .filter(item => item.claimable)
        .map(item => item.key);
      setSelectedRowKeys(claimableKeys);
    } else {
      setSelectedRowKeys([]);
    }
  };

  useEffect(() => {
    if (address) {
      fetchClaimableNFTs();
    }
  }, [address]);
  
  useEffect(() => {
    fetchClaimableNFTs();
  }, []);

  const handleTableChange = (pagination) => {
    fetchClaimableNFTs(pagination.current, pagination.pageSize);
  };

  const claimableCount = nftList.filter(item => item.claimable).length;
  const isAllSelected = selectedRowKeys.length === claimableCount && claimableCount > 0;
  const isIndeterminate = selectedRowKeys.length > 0 && selectedRowKeys.length < claimableCount;

  return (
    <div className="batch-claim-container">
      <div className="batch-claim-header">
        <h2>批量领取NFT</h2>
        <p className="description">选择您要领取的NFT，最多可同时领取100个，领取到帐会有3分钟延迟，请不要重复提交。</p>
      </div>

      <div className="batch-claim-actions">
        <div className="selection-info">
          <Checkbox
            indeterminate={isIndeterminate}
            checked={isAllSelected}
            onChange={(e) => handleSelectAll(e.target.checked)}
          >
            全选
          </Checkbox>
          <span className="selected-count">
            已选择 {selectedRowKeys.length} / {claimableCount} 个可领取NFT
          </span>
        </div>
        
        <Button
          type="primary"
          size="large"
          loading={loading}
          disabled={selectedRowKeys.length === 0}
          onClick={handleBatchClaim}
          className="batch-claim-btn"
        >
          批量领取 ({selectedRowKeys.length})
        </Button>
      </div>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={nftList}
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: false,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
        }}
        onChange={handleTableChange}
        className="batch-claim-table"
        scroll={{ x: 800 }}
      />
    </div>
  );
};

export default BatchClaim;