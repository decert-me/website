import codingAxios from "../coding";
import serviceAxios from "../index";

// 获取登录签名信息
export const getChallengers = (data) => {
    return serviceAxios({
        url: `/v1/quests/${data.questId}/challengeUsers`,
        method: "get",
        data
    })
}

export const getCollectionQuest = (data) => {
    return serviceAxios({
        url: `/v1/collection?id=${data.id}`,
        method: "get",
        data
    })
}

export const getCollectionChallenger = (data) => {
    return serviceAxios({
        url: `/v1/collection/challengeUsers?collection_id=${data.id}&page=${data.page}&pageSize=${data.pageSize}`,
        method: "get",
        data
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