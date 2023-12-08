import serviceAxios from "../index";


// 审核开放题
export const reviewOpenQuest = (data) => {
    return serviceAxios({
        url: `/v1/openQuest/reviewOpenQuest`,
        method: "post",
        data
    })
}

// 获取开放题列表
export const getUserOpenQuestList = (data) => {
    return serviceAxios({
        url: `/v1/openQuest/getUserOpenQuestList`,
        method: "post",
        data
    })
}