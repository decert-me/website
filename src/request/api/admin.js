import adminAxios from "../admin"

export const getTutorialList = (data) => {
    return adminAxios({
        url: `/v1/tutorial/getTutorialList`,
        method: "post",
        data
    })
}

export const getLabelList = (data) => {
    return adminAxios({
        url: `/v1/tutorial/getLabelList`,
        method: "post",
        data
    })
}