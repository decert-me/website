import { authLoginSign, getLoginMsg } from "../request/api/public";
import bs58 from 'bs58'

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
                            setTimeout(() => {
                                resolve();
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
                        setTimeout(() => {
                            resolve();
                        }, 100);
                    }
                })
            }
    });
}