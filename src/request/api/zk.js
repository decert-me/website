import serviceAxios from ".."

// 获取DID签名
export const getDidSignMessage = (data) => {
    return serviceAxios({
        url: `/v1/zcloak/getDidSignMessage?did=${data.did}`,
        method: "get",
        data
    })
}

// 保存签名和DID
export const saveSignAndDid = (data) => {
    return serviceAxios({
        url: `/v1/zcloak/saveSignAndDid`,
        method: "post",
        data
    })
}

// 获取zk
export const getAddressDid = (data) => {
    return serviceAxios({
        url: `/v1/zcloak/getAddressDid`,
        method: "get",
        data
    })
}

// 获取keyFile
export const getKeyFileSignature = (data) => {
    return serviceAxios({
        url: `/v1/zcloak/getKeyFileSignature`,
        method: "get",
        data
    })
}

// 
export const generateCard = (data) => {
    return serviceAxios({
        url: `/v1/zcloak/generateCard`,
        method: "post",
        data
    })
}