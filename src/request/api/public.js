import serviceAxios from "../index";
import ipfsAxios from "../ipfs";
import nftAxios from "../nft";

// 获取登录签名信息
export const getLoginMsg = (data) => {
    return serviceAxios({
        url: `/users/getLoginMessage?address=${data.address}`,
        method: "get",
        data
    })
}

// 校验登录签名信息
export const authLoginSign = (data) => {
    return serviceAxios({
        url: `/users/authLoginSign`,
        method: "post",
        data
    })
}

// 获取个人资料
export const getUser = (data) => {
    return serviceAxios({
        url: `/users/${data.address}`,
        method: "get",
        data
    })
}

// 更新资料
export const putUser = (data) => {
    return serviceAxios({
        url: `/users/${data.address}`,
        method: "put",
        data
    })
}

// 更新头像
export const uploadAvatar = (data) => {
    return serviceAxios({
        url: `/users/avatar`,
        method: "post",
        data
    })
}

// 获取完成的挑战
export const getChallengeComplete = (data) => {
    return serviceAxios({
        url: `/users/challenge/${data.address}?type=${data.type}&page=${data.page}&pageSize=${data.pageSize}${data.claimable ? "&claimable="+data.claimable : ""}`,
        method: "get",
        data
    })
}

// 获取发布的挑战
export const getChallengeCreate = (data) => {
    return serviceAxios({
        url: `/users/quests/${data.address}?page=${data.page}&pageSize=${data.pageSize}`,
        method: "get",
        data
    })
}

// 获取 challenge
export const getQuests = (data) => {
    return serviceAxios({
        url: `/quests${data.id ? '/'+data.id : ''}${data.pageSize ? '?pageSize='+data.pageSize : ''}${data.page ? '&page='+data.page : ''}${data.type ? '?type='+data.type : ''}`,
        method: "get",
        data
    })
}

// 提交 challenge 
export const submitChallenge = (data) => {
    return serviceAxios({
        url: `/challenge`,
        method: "post",
        data
    })
}

// 添加 challenge
export const addQuests = (data) => {
    return serviceAxios({
        url: `/quests`,
        method: "post",
        data
    })
}

// 修改 challenge
export const modifyQuests = (data) => {
    return serviceAxios({
        url: `/quests`,
        method: "put",
        data
    })
}

// 修改 recommend
export const modifyRecommend = (data) => {
    return serviceAxios({
        url: `/quests/recommend`,
        method: "put",
        data
    })
}

// 提交交易哈希
export const submitHash = (data) => {
    return serviceAxios({
        url: `/transaction/submit`,
        method: "post",
        data
    })
}

// 获取 Discord 是否绑定
export const verifyDiscord = (data) => {
    return serviceAxios({
        url: `/users/discord`,
        method: "get",
        data
    })
}

// 获取铸造所需签名
export const getClaimHash = (data) => {
    return serviceAxios({
        url: `/badge/claim`,
        method: "post",
        data
    })
}

// 分享推文免费获取Badge
export const submitClaimTweet = (data) => {
    return serviceAxios({
        url: `/badge/submitClaimTweet`,
        method: "post",
        data
    })
}


// ipfs ===>>>>>>>>

export const ipfsImg = (data) => {
    return ipfsAxios({
        url: `/uploadFile`,
        method: "post",
        data
    })
}

// 挑战json
export const challengeJson = (data) => {
    return ipfsAxios({
        url: `/uploadJson?type=challenge`,
        method: "post",
        data
    })
}

// nftjson
export const nftJson = (data) => {
    return ipfsAxios({
        url: `/uploadJson?type=nft`,
        method: "post",
        data
    })
}

// 获取教程阅览进度
export const tutorialProgress = (data) => {
    return serviceAxios({
        url: `/tutorial/progress`,
        method: "post",
        data
    })
}

// 获取微信分享二维码
export const wechatShare = (data) => {
    return serviceAxios({
        url: `/badge/submitClaimShare`,
        method: "post",
        data
    })
}

// 点击分享链接
export const shareClick = (data) => {
    return serviceAxios({
        url: `/share/click`,
        method: "post",
        data
    })
}
