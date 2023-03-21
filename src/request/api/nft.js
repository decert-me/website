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


