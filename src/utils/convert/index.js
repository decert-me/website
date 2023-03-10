export const convertToken = (token) => {
    if (!token) {
        return false
    }
    let strings = token.split("."); //截取token，获取载体
    try {
        var userinfo = JSON.parse(decodeURIComponent(escape(window.atob(strings[1].replace(/-/g, "+").replace(/_/g, "/"))))); //解析，需要吧‘_’,'-'进行转换否则会无法解析
        // 判断token有效期
        const now = parseInt(new Date().getTime() / 1000);
        var status = now > userinfo.exp ? false : true;   //false 超时 : true 未超时
    } catch (error) {
        localStorage.clear();
    }

    return status
}

export const convertDifficulty = (value) => {
    switch (value) {
        case 0:
            return 'easy'
        case 1:
            return 'normal'
        case 2:
            return 'diff'
        default:
            return ''
    }
}

export const convertTime = (value) => {
    const h = value / 60 / 60;
    const d = value / 60 / 60 / 24;
    const w = value / 60 / 60 / 24 / 7;

    let time = value / 60;
    let type = 'm';

    if (h >= 1) {
        time = h;
        type = 'h'
    }
    if (d >= 1) {
        time = d;
        type = 'd';
    }
    if (w >= 1) {
        time = w;
        type = 'w';
    }

    return {
        type,
        time
    }
}