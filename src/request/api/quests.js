import serviceAxios from "../index";

// 获取登录签名信息
export const getChallengers = (data) => {
    return serviceAxios({
        url: `/quests/${data.questId}/challengeUsers`,
        method: "get",
        data
    })
}


