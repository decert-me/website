import serviceAxios from ".."


// 审核开放题
export const reviewOpenQuest = (data) => {
    return serviceAxios({
        url: `/v1/challenge/reviewOpenQuestV2`,
        method: "post",
        data
    })
}

// 获取开放题列表
export const getUserOpenQuestList = (data) => {
    return serviceAxios({
        url: `/v1/challenge/getUserOpenQuestListV2`,
        method: "post",
        data
    })
}