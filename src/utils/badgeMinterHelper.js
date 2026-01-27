import { ethers } from 'ethers';
import { generateMintSignature } from '@/request/api/public';

// BadgeMinter 合约地址(多链配置)
const BADGE_MINTER_ADDRESSES = {
    10: '0x0aa319263401eEcecd5Fa2C34636b1057A8B2BFB',      // Optimism 主网
    11155420: '0xEdC46868f04d482f04A8c29E915aBED72C03cD35', // OP Sepolia 测试网
    137: '0x0aa319263401eEcecd5Fa2C34636b1057A8B2BFB',     // Polygon 主网
    42161: '0x0aa319263401eEcecd5Fa2C34636b1057A8B2BFB'    // Arbitrum 主网
};

// BadgeMinter ABI - claim 方法
const BADGE_MINTER_ABI = [
    {
        "inputs": [
            {"internalType": "address", "name": "to", "type": "address"},
            {"internalType": "uint256", "name": "questId", "type": "uint256"},
            {"internalType": "string", "name": "uri", "type": "string"},
            {"internalType": "bytes", "name": "signature", "type": "bytes"}
        ],
        "name": "claim",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    }
];

/**
 * 用户自主 mint NFT(通过现有 BadgeMinter 合约)
 * @param {number} chainId - 链 ID
 * @param {object} signatureData - 后端返回的签名数据
 * @returns {Promise<object>} 交易回执
 */
export async function mintNFTViaExistingContract(chainId, signatureData) {
    console.log('[DEBUG mintNFT] 1. 开始 mintNFTViaExistingContract, chainId:', chainId);
    console.log('[DEBUG mintNFT] 1. signatureData:', signatureData);

    if (!window.ethereum) {
        throw new Error('请先安装 MetaMask 钱包');
    }

    console.log('[DEBUG mintNFT] 2. 先切换到目标网络...');
    // 先主动切换到目标网络
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${chainId.toString(16)}` }],
        });
        console.log('[DEBUG mintNFT] 2. 网络切换成功，等待 2 秒...');
        // 等待链切换完成，给更多时间让 MetaMask 更新状态
        await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (switchError) {
        console.error('[DEBUG mintNFT] 2. 网络切换失败:', switchError);
        if (switchError.code === 4902) {
            throw new Error('请先在钱包中添加该网络');
        }
        // 如果是用户拒绝，抛出错误
        if (switchError.code === 4001) {
            throw new Error('用户拒绝切换网络');
        }
    }

    console.log('[DEBUG mintNFT] 3. 创建 Web3Provider...');
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    console.log('[DEBUG mintNFT] 4. 获取 signer...');
    const signer = provider.getSigner();

    console.log('[DEBUG mintNFT] 5. 获取用户地址...');
    const userAddress = await signer.getAddress();
    console.log('[DEBUG mintNFT] 5. 用户地址:', userAddress);

    // 验证地址匹配
    if (userAddress.toLowerCase() !== signatureData.to.toLowerCase()) {
        throw new Error('钱包地址与签名地址不匹配');
    }

    console.log('[DEBUG mintNFT] 6. 检查网络...');
    // 检查网络
    const network = await provider.getNetwork();
    console.log('[DEBUG mintNFT] 6. 当前网络:', network);
    if (network.chainId !== chainId) {
        throw new Error(`网络不匹配，请切换到 Chain ID: ${chainId}`);
    }

    console.log('[DEBUG mintNFT] 7. 获取合约实例...');
    // 获取合约实例
    const badgeMinterAddress = BADGE_MINTER_ADDRESSES[chainId];
    console.log('[DEBUG mintNFT] 7. BadgeMinter 地址:', badgeMinterAddress);
    if (!badgeMinterAddress) {
        throw new Error(`不支持的链 ID: ${chainId}`);
    }

    const badgeMinterContract = new ethers.Contract(
        badgeMinterAddress,
        BADGE_MINTER_ABI,
        signer
    );
    console.log('[DEBUG mintNFT] 7. 合约实例创建成功');

    console.log('[DEBUG mintNFT] 8. 开始估算 gas...');
    // 估算 gas
    let gasEstimate;
    try {
        gasEstimate = await badgeMinterContract.estimateGas.claim(
            signatureData.to,
            signatureData.questId,
            signatureData.uri,
            signatureData.signature
        );
        console.log('[DEBUG mintNFT] 8. 预估 gas:', gasEstimate.toString());
    } catch (error) {
        console.warn('[DEBUG mintNFT] 8. Gas 估算失败:', error);
    }

    console.log('[DEBUG mintNFT] 9. 调用合约 claim 方法...');
    // 调用合约
    try {
        const tx = await badgeMinterContract.claim(
            signatureData.to,
            signatureData.questId,
            signatureData.uri,
            signatureData.signature,
            {
                gasLimit: gasEstimate ? gasEstimate.mul(120).div(100) : 200000  // 增加 20% 余量
            }
        );

        console.log('[DEBUG mintNFT] 9. 交易已提交, hash:', tx.hash);

        // 等待交易确认
        const receipt = await tx.wait();
        console.log('Mint 成功！', receipt);

        return receipt;

    } catch (error) {
        console.error('Mint 失败:', error);

        // 解析错误信息
        if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
            throw new Error('用户拒绝了交易');
        } else if (error.message?.includes('InvalidSigner')) {
            throw new Error('签名验证失败');
        } else if (error.message?.includes('AlreadyHoldsBadge')) {
            throw new Error('您已经持有该徽章');
        } else if (error.message?.includes('insufficient funds')) {
            throw new Error('账户余额不足以支付 gas 费');
        } else {
            throw error;
        }
    }
}

/**
 * 获取 gas 费估算(用于显示给用户)
 * @param {number} chainId - 链 ID
 * @param {object} signatureData - 签名数据
 * @returns {Promise<object|null>} Gas 费用信息
 */
export async function estimateGasFee(chainId, signatureData) {
    if (!window.ethereum) return null;

    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const badgeMinterAddress = BADGE_MINTER_ADDRESSES[chainId];

        const badgeMinterContract = new ethers.Contract(
            badgeMinterAddress,
            BADGE_MINTER_ABI,
            provider
        );

        const gasEstimate = await badgeMinterContract.estimateGas.claim(
            signatureData.to,
            signatureData.questId,
            signatureData.uri,
            signatureData.signature
        );

        const gasPrice = await provider.getGasPrice();
        const gasFee = gasEstimate.mul(gasPrice);

        return {
            gasLimit: gasEstimate.toString(),
            gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei'),
            gasFee: ethers.utils.formatEther(gasFee)
        };
    } catch (error) {
        console.error('Gas 估算失败:', error);
        return null;
    }
}

/**
 * 用户自主 mint NFT (完整流程: 获取签名 + 调用合约)
 * @param {number} chainId - 链 ID
 * @param {string} tokenId - Quest Token ID
 * @param {number} score - 分数
 * @param {string} answer - 加密后的答案
 * @param {string} imageUri - NFT 图片/元数据 URI
 * @returns {Promise<object>} 交易回执
 */
export async function mintNFTWithBackendSignature(chainId, tokenId, score, answer, imageUri) {
    try {
        // 1. 调用后端获取签名
        const res = await generateMintSignature({
            tokenId: tokenId,
            score: score,
            answer: answer,
            image_uri: imageUri,  // 传递 image_uri 字段
            chain_id: chainId
        });

        console.log('[DEBUG] Backend response:', JSON.stringify(res, null, 2));
        console.log('[DEBUG] res.status:', res?.status);
        console.log('[DEBUG] res.message:', res?.message);
        console.log('[DEBUG] res.data:', res?.data);

        // 后端返回格式: { status: 0, message: "操作成功！", data: {...} }
        // status === 0 表示成功
        if (!res || res.status !== 0 || !res.data) {
            const errorMsg = res?.message || '获取签名失败';
            console.error('[DEBUG] API error - status:', res?.status, 'message:', errorMsg);
            throw new Error(errorMsg);
        }

        const signatureData = res.data;  // 签名数据在 res.data 中

        // 2. 使用签名调用合约
        const receipt = await mintNFTViaExistingContract(chainId, signatureData);

        return receipt;
    } catch (error) {
        console.error('Mint NFT 失败:', error);
        throw error;
    }
}
