import { authLoginSign, getLoginMsg, submitChallenge } from "../request/api/public";
import bs58 from 'bs58'

async function submitClaimable(params) {
    // submitChallenge
    const local = localStorage.getItem("decert.cache");
    if (local) {
        let cache = JSON.parse(local);
        // 有可领取的挑战
        if (cache?.claimable && cache.claimable.length !== 0) {
            for (let i = 0; i < cache.claimable.length; i++) {
                const quest = cache.claimable[i];
                const data = cache[quest.token_id];
                await submitChallenge({
                    token_id: quest.token_id,
                    answer: JSON.stringify(data)
                })
                .then(res => {
                    delete cache[quest.token_id]
                })
            }
            cache.claimable = [];
            localStorage.setItem("decert.cache", JSON.stringify(cache));
        }
    }
}

export async function GetSign(params) {
    
    const { address, signer, disconnect } = params;
    let message;

    return await new Promise( async(resolve, reject) => {
        // 1、获取nonce
            await getLoginMsg({address: address})
            .then(res => {
                if (res) {
                    message = res.data.loginMessage;
                }
            })
            // 2、获取签名
            // 判断当前address为solana
            if (/^0x/.test(address)) {
                await signer?.signMessage(message)
                .then(async(res) => {
                    // 3、获取token
                    await authLoginSign({
                        address: address,
                        message: message,
                        signature: res
                    })
                    .then(res => {
                        if (res) {
                            localStorage.setItem(`decert.token`,res.data.token);
                            // TODO: 上传可领取挑战答案
                            setTimeout(() => {
                                submitClaimable()
                                .then(res => resolve())
                            }, 100);
                        }
                    })
                })
                .catch(err => {
                    reject(err);
                    disconnect();
                })
            }else{
                const msg = new TextEncoder().encode(message);
                const arr = await signer.signMessage(msg);
                const str = bs58.encode(arr)

                await authLoginSign({
                    address: address,
                    message: message,
                    signature: str
                })
                .then(res => {
                    if (res) {
                        localStorage.setItem(`decert.token`,res.data.token);
                        // TODO: 上传可领取挑战答案
                        setTimeout(() => {
                            submitClaimable()
                            .then(res => resolve())
                        }, 100);
                    }
                })
            }
    });
}