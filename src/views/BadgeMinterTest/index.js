import React, { useState } from 'react';
import { Button, Input, message, Card, Descriptions } from 'antd';
import { mintNFTViaExistingContract, estimateGasFee } from '@/utils/badgeMinterHelper';

const { TextArea } = Input;

/**
 * BadgeMinter 测试页面
 * 用于手动测试合约调用
 */
export default function BadgeMinterTest() {
    const [signatureData, setSignatureData] = useState({
        to: '',
        questId: '999999',
        uri: 'ipfs://QmTest123',
        signature: ''
    });
    const [gasInfo, setGasInfo] = useState(null);
    const [txReceipt, setTxReceipt] = useState(null);

    // 估算 gas 费
    const handleEstimateGas = async () => {
        try {
            message.loading({ content: '正在估算 gas...', key: 'gas' });
            const info = await estimateGasFee(11155420, signatureData);
            setGasInfo(info);
            message.success({ content: 'Gas 估算成功', key: 'gas' });
        } catch (error) {
            message.error({ content: error.message, key: 'gas' });
        }
    };

    // 调用合约 mint
    const handleMint = async () => {
        try {
            message.loading({ content: '正在调用合约...', key: 'mint' });
            const receipt = await mintNFTViaExistingContract(11155420, signatureData);
            setTxReceipt(receipt);
            message.success({ content: 'Mint 成功！', key: 'mint' });
        } catch (error) {
            message.error({ content: error.message, key: 'mint' });
        }
    };

    return (
        <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
            <Card title="BadgeMinter 测试工具 (OP Sepolia)">
                <div style={{ marginBottom: 20 }}>
                    <label>接收地址 (to):</label>
                    <Input
                        value={signatureData.to}
                        onChange={(e) => setSignatureData({ ...signatureData, to: e.target.value })}
                        placeholder="0x..."
                    />
                </div>

                <div style={{ marginBottom: 20 }}>
                    <label>Quest ID:</label>
                    <Input
                        value={signatureData.questId}
                        onChange={(e) => setSignatureData({ ...signatureData, questId: e.target.value })}
                        placeholder="999999"
                    />
                </div>

                <div style={{ marginBottom: 20 }}>
                    <label>URI:</label>
                    <Input
                        value={signatureData.uri}
                        onChange={(e) => setSignatureData({ ...signatureData, uri: e.target.value })}
                        placeholder="ipfs://QmTest123"
                    />
                </div>

                <div style={{ marginBottom: 20 }}>
                    <label>签名 (signature):</label>
                    <TextArea
                        rows={4}
                        value={signatureData.signature}
                        onChange={(e) => setSignatureData({ ...signatureData, signature: e.target.value })}
                        placeholder="0x..."
                    />
                </div>

                <div style={{ marginBottom: 20 }}>
                    <Button onClick={handleEstimateGas} style={{ marginRight: 10 }}>
                        估算 Gas
                    </Button>
                    <Button type="primary" onClick={handleMint}>
                        调用合约 Mint
                    </Button>
                </div>

                {gasInfo && (
                    <Card title="Gas 估算" size="small" style={{ marginBottom: 20 }}>
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Gas Limit">{gasInfo.gasLimit}</Descriptions.Item>
                            <Descriptions.Item label="Gas Price">{parseFloat(gasInfo.gasPrice).toFixed(2)} Gwei</Descriptions.Item>
                            <Descriptions.Item label="预估费用">{parseFloat(gasInfo.gasFee).toFixed(6)} ETH</Descriptions.Item>
                        </Descriptions>
                    </Card>
                )}

                {txReceipt && (
                    <Card title="交易结果" size="small">
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="交易哈希">
                                <a
                                    href={`https://sepolia-optimism.etherscan.io/tx/${txReceipt.transactionHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {txReceipt.transactionHash}
                                </a>
                            </Descriptions.Item>
                            <Descriptions.Item label="区块高度">{txReceipt.blockNumber}</Descriptions.Item>
                            <Descriptions.Item label="Gas Used">{txReceipt.gasUsed?.toString()}</Descriptions.Item>
                            <Descriptions.Item label="状态">成功 ✅</Descriptions.Item>
                        </Descriptions>
                    </Card>
                )}
            </Card>

            <Card title="使用说明" size="small" style={{ marginTop: 20 }}>
                <ol>
                    <li>确保 MetaMask 已连接并切换到 OP Sepolia 测试网</li>
                    <li>确保钱包有测试 ETH (从水龙头获取)</li>
                    <li>填写接收地址(通常是你自己的钱包地址)</li>
                    <li>运行 test-signature-generator.js 生成签名</li>
                    <li>将签名粘贴到上面的"签名"输入框</li>
                    <li>点击"调用合约 Mint"</li>
                    <li>在 MetaMask 中确认交易</li>
                </ol>
            </Card>
        </div>
    );
}
