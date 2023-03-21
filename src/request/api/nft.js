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
        url: `/contract/${data.address}?chain_id=${data.chainId}&page=1&pageSize=1`,
        method: "get",
        data
    })
}

export const getAllNft = (data) => {
    return nftAxios({
        url: `/own${data.address ? '/'+data.address : ''}${data.contract_id ? "?contract_id="+data.contract_id : ''}`,
        method: "get",
        data
    })
}

