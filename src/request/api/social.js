import socialAxios from "../social";


// 获取绑定 Discord 链接
export const bindDiscord = (data) => {
    return socialAxios({
        url: `/v1/authorization/discord`,
        method: "get",
        data
    })
}

// 获取绑定 Wechat 链接
export const bindWechat = (data) => {
    return socialAxios({
        url: `/wechat/getWechatQrcode`,
        method: "get",
        data
    })
}


// 提交 Discord 绑定信息
export const authDiscord = (data) => {
    return socialAxios({
        url: `/v1/callback/discord`,
        method: "post",
        data
    })
}

