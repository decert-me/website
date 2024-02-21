import serviceAxios from "../index";


// 获取邮箱绑定验证码
export const getEmailCode = (data) => {
    return serviceAxios({
        url: `/v1/social/getEmailBindCode`,
        method: "post",
        data
    })
}

// 绑定邮箱
export const bindEmail = (data) => {
    return serviceAxios({
        url: `/v1/social/emailBindAddress`,
        method: "post",
        data
    })
}

// 获取绑定 Discord 链接
export const bindDiscord = (data) => {
    return serviceAxios({
        url: `/v1/social/getDiscordAuthorizationURL?callback=${data.callback}`,
        method: "get"
    })
}

// 获取绑定 Github 链接
export const bindGithub = (data) => {
    return serviceAxios({
        url: `/v1/social/getGithubAuthorizationURL?callback=${data.callback}`,
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

// 提交 Github 绑定信息
export const authGithub = (data) => {
    return serviceAxios({
        url: `/v1/social/githubBindAddress`,
        method: "post",
        data
    })
}