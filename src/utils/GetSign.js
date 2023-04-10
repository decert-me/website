import { authLoginSign, getLoginMsg } from "../request/api/public";

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
            console.log(message);
        // 2、获取签名
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
                        localStorage.setItem(`decert.token`,res.data.token)
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
    });
}