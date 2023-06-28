import nftAxios from "../nft";

export const getContracts = (data) => {
    return nftAxios({
        url: `/account/own/${data.address}/contract`,
        method: "get",
        data
    })
}

export const getContractNfts = (data) => {
    return nftAxios({
        url: `/account/contract/${data.address}?chain_id=${data.chainId}&page=${data.page}&pageSize=${data.pageSize}`,
        method: "get",
        data
    })
}

export const getAllNft = (data) => {
    return nftAxios({
        url: `/account/own${data.address ? '/'+data.address : ''}?page=${data.page}&pageSize=${data.pageSize}${data.contract_id ? "&contract_id="+data.contract_id : ''}${data.status ? "&status="+data.status : ''}`,
        method: "get",
        data
    })
}

export const modifyNftStatus = (data) => {
    return nftAxios({
        url: `/account/own/collection/${data.ID}`,
        method: "put",
        data
    })
}


export const flagNft = (data) => {
    return nftAxios({
        url: `/account/own/collection`,
        method: "post",
        data
    })
}

// 获取 Ens 
export const getEns = (data) => {
    return nftAxios({
        url: `/ens/${data.address}`,
        method: "get",
        data
    })
}

export const reloadSbt = (data) => {
    return nftAxios({
        url: `/account/own/refreshUserData`,
        method: "post",
        data
    })
}