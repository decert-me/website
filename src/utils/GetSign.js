import { authLoginSign, getLoginMsg } from "../request/api/public";

export async function GetSign(params) {
    
    const { address, signer } = params;
    let message;

    // 1、获取nonce
    await getLoginMsg({address: address})
    .then(res => {
        if (res) {
            message = res.data.loginMessage;
        }
    })
    // 2、获取签名
    await signer?.signMessage(message)
    .then(res => {
        // 3、获取token
        authLoginSign({
            address: address,
            message: message,
            signature: res
        })
        .then(res => {
            if (res) {
                localStorage.setItem(`decert.token`,res.data.token)
            }
        })
    })
    .catch(err => {
        console.log(err);
    })

}