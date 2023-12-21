import codingAxios from "../coding";
import serviceAxios from "../index";

// 获取挑战者
export const getChallengers = (data) => {
    return serviceAxios({
        url: `/v1/quests/${data.questId}/challengeUsers`,
        method: "get"
    })
}

// 获取挑战闪电榜
export const getQuestFlashRank = (data) => {
    return serviceAxios({
        url: `/v1/quests/${data.questId}/getQuestFlashRank`,
        method: "get"
    })
}

// 获取挑战高分榜
export const getQuestHighRank = (data) => {
    return serviceAxios({
        url: `/v1/quests/${data.questId}/getQuestHighRank`,
        method: "get"
    })
}

// 获取挑战holder榜
export const getQuestHolderRank = (data) => {
    return serviceAxios({
        url: `/v1/quests/${data.questId}/getQuestHolderRank?page=${data.page}&pageSize=${data.pageSize}`,
        method: "get"
    })
}


// 合辑详情
export const getCollectionQuest = (data) => {
    return serviceAxios({
        url: `/v1/collection?id=${data.id}`,
        method: "get"
    })
}

// 合辑挑战者
export const getCollectionChallenger = (data) => {
    return serviceAxios({
        url: `/v1/collection/challengeUsers?collection_id=${data.id}&page=${data.page}&pageSize=${data.pageSize}`,
        method: "get"
    })
}

// 领取合辑NFT
export const claimCollection = (data) => {
    return serviceAxios({
        url: `/v1/collection/claim`,
        method: "post",
        data
    })
}


export const checkQuestInCollection = (data) => {
    return serviceAxios({
        url: `/v1/collection/checkQuestInCollection?token_id=${data.id}`,
        method: "get"
    })
}


// 

// 代码题 

// 代码自测

export const codeRun = (data) => {
    return codingAxios({
        url: `/v1/judge/run/tryRun`,
        method: "post",
        data
    })
}

export const codeTest = (data) => {
    return codingAxios({
        url: `/v1/judge/run/tryTestRun`,
        method: "post",
        data
    })
}