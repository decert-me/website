import nftAxios from "../nft";

export const getContracts = (data) => {
    return nftAxios({
        url: `/own/${data.address}/contract`,
        method: "get",
        data
    })
}

export const getContractNfts = (data) => {
    return nftAxios({
        url: `/contract/${data.address}?chain_id=${data.chainId}&page=${data.page}&pageSize=${data.pageSize}`,
        method: "get",
        data
    })
}

export const getAllNft = (data) => {
    return nftAxios({
        url: `/own${data.address ? '/'+data.address : ''}${data.contract_id ? "?contract_id="+data.contract_id : ''}${data.status ? "?status="+data.status : ''}`,
        method: "get",
        data
    })
}

export const modifyNftStatus = (data) => {
    return nftAxios({
        url: `/own/collection/:${data.ID}`,
        method: "put",
        data
    })
}


export const flagNft = (data) => {
    return nftAxios({
        url: `/own/collection`,
        method: "post",
        data
    })
}
