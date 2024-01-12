import serviceAxios from "../index";
import ipfsAxios from "../ipfs";
import nftAxios from "../nft";

// 获取登录签名信息
export const getLoginMsg = (data) => {
    return serviceAxios({
        url: `/v1/users/getLoginMessage?address=${data.address}`,
        method: "get",
        data
    })
}

// 校验登录签名信息
export const authLoginSign = (data) => {
    return serviceAxios({
        url: `/v1/users/authLoginSign`,
        method: "post",
        data
    })
}

// 获取个人资料
export const getUser = (data) => {
    return serviceAxios({
        url: `/v1/users/${data.address}`,
        method: "get",
        data
    })
}

// 更新资料
export const putUser = (data) => {
    return serviceAxios({
        url: `/v1/users/${data.address}`,
        method: "put",
        data
    })
}

// 更新头像
export const uploadAvatar = (data) => {
    return serviceAxios({
        url: `/v1/users/avatar`,
        method: "post",
        data
    })
}

// 获取完成的挑战
export const getChallengeComplete = (data) => {
    return serviceAxios({
        url: `/v1/users/challenge/${data.address}?type=${data.type}&page=${data.page}&pageSize=${data.pageSize}${data.claimable ? "&claimable="+data.claimable : ""}`,
        method: "get",
        data
    })
}

// 获取发布的挑战
export const getChallengeCreate = (data) => {
    return serviceAxios({
        url: `/v1/users/quests/${data.address}?page=${data.page}&pageSize=${data.pageSize}`,
        method: "get",
        data
    })
}

// 获取 challenge
export const getQuests = (data) => {
    return serviceAxios({
        url: `/v1/quests${data.id ? '/'+data.id : ''}${data.original ? '?original='+data.original : ''}${data.pageSize ? '?pageSize='+data.pageSize : ''}${data.page ? '&page='+data.page : ''}${data.type ? '&type='+data.type : ''}`,
        method: "get",
        data
    })
}

// 提交 challenge 
export const submitChallenge = (data) => {
    return serviceAxios({
        url: `/v1/challenge`,
        method: "post",
        data
    })
}

// 添加 challenge
export const addQuests = (data) => {
    return serviceAxios({
        url: `/v2/quests`,
        method: "post",
        data
    })
}

// 修改 challenge
export const modifyQuests = (data) => {
    return serviceAxios({
        url: `/v2/quests`,
        method: "put",
        data
    })
}

// 修改 recommend
export const modifyRecommend = (data) => {
    return serviceAxios({
        url: `/v1/quests/recommend`,
        method: "put",
        data
    })
}

// 提交交易哈希
export const submitHash = (data) => {
    return serviceAxios({
        url: `/v1/transaction/submit`,
        method: "post",
        data
    })
}

// 获取 Discord 是否绑定
// export const verifyDiscord = (data) => {
//     return serviceAxios({
//         url: `/v1/users/discord`,
//         method: "get",
//         data
//     })
// }

// 检测 social 是否绑定
export const hasBindSocialAccount = (data) => {
    return serviceAxios({
        url: `/v1/users/hasBindSocialAccount`,
        method: "get",
        data
    })
}


// 获取铸造所需签名
export const getClaimHash = (data) => {
    return serviceAxios({
        url: `/v1/badge/claim`,
        method: "post",
        data
    })
}

// 分享推文免费获取Badge
export const submitClaimTweet = (data) => {
    return serviceAxios({
        url: `/v1/badge/submitClaimTweet`,
        method: "post",
        data
    })
}

// 是否空投
export const hasClaimed = (data) => {
    return serviceAxios({
        url: `/v1/badge/hasClaimed/${data.id}`,
        method: "get",
        data
    })
}



// ipfs ===>>>>>>>>

export const ipfsImg = (data) => {
    return ipfsAxios({
        url: `/v1/ipfs/uploadFile`,
        method: "post",
        data
    })
}

// 挑战json
export const challengeJson = (data) => {
    return ipfsAxios({
        url: `/v1/ipfs/uploadJson?type=challenge`,
        method: "post",
        data
    })
}

// nftjson
export const nftJson = (data, type) => {
    return ipfsAxios({
        url: `/v1/ipfs/uploadJson?type=${type || "nft"}`,
        method: "post",
        data
    })
}

export const uploadFile = (data) => {
    return ipfsAxios({
        url: `/v1/ipfs/uploadFile?type=open_quest`,
        method: "post",
        data
    })
}

// 获取教程阅览进度
export const tutorialProgress = (data) => {
    return serviceAxios({
        url: `/v1/tutorial/progress`,
        method: "post",
        data
    })
}

// 获取微信分享二维码
export const wechatShare = (data) => {
    return serviceAxios({
        url: `/v1/badge/submitClaimShare`,
        method: "post",
        data
    })
}

// 点击分享链接
export const shareClick = (data) => {
    return serviceAxios({
        url: `/v1/share/click`,
        method: "post",
        data
    })
}

// 获取阅读进度列表
export const progressList = (data) => {
    return serviceAxios({
        url: `/v1/tutorial/progressList`,
        method: "post",
        data
    })
}

// 获取未读消息
export const getUnreadMessage = (data) => {
    return serviceAxios({
        url: `/v1/message/getUnreadMessage`,
        method: "get",
        data
    })
}

// 阅读消息
export const readMessage = (data) => {
    return serviceAxios({
        url: `/v1/message/readMessage`,
        method: "post",
        data
    })
}

// 获取当前登陆用户是否能创建开放题
export const hasCreateOpenQuestPerm = (data) => {
    return serviceAxios({
        url: `/v1/users/hasCreateOpenQuestPerm`,
        method: "get",
        data
    })
}
