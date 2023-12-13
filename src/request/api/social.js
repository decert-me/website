import serviceAxios from "../index";


// 获取绑定 Discord 链接
export const bindDiscord = (data) => {
    return serviceAxios({
        url: `/v1/social/getDiscordAuthorizationURL?callback=${data.callback}`,
        method: "get"
    })
}

// 获取绑定 Wechat 链接
export const bindWechat = (data) => {
    return serviceAxios({
        url: `/v1/social/getWechatQrcode`,
        method: "get",
        data
    })
}


// 提交 Discord 绑定信息
export const authDiscord = (data) => {
    return serviceAxios({
        url: `/v1/social/discordBindAddress`,
        method: "post",
        data
    })
}

