import adminAxios from "../admin"

export const getTutorialList = (data) => {
    return adminAxios({
        url: `/tutorial/getTutorialList`,
        method: "post",
        data
    })
}

export const getLabelList = (data) => {
    return adminAxios({
        url: `/label/getLabelList`,
        method: "post",
        data
    })
}
