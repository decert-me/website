import nftAxios from "../nft";

export const getContracts = (data) => {
    return nftAxios({
        url: `/own/${data.address}/contract`,
        method: "get",
        data
    })
}




