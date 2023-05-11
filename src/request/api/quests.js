import codingAxios from "../coding";
import serviceAxios from "../index";

// 获取登录签名信息
export const getChallengers = (data) => {
    return serviceAxios({
        url: `/quests/${data.questId}/challengeUsers`,
        method: "get",
        data
    })
}

// 代码题 

// 代码自测

export const codeTest = (data) => {
    return codingAxios({
        url: `/run/tryRun`,
        method: "post",
        data
    })
}