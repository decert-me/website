import { constans } from "../constans";

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
        localStorage.removeItem("decert.token");
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

export const convertTime = (value, resType) => {
    const h = value / 60 / 60;
    const d = value / 60 / 60 / 24;
    const w = value / 60 / 60 / 24 / 7;

    let time = value / 60;
    let type = resType ? 'time-info.mm' : 'm';
    if (h >= 1) {
        time = h;
        type = resType ? 'time-info.h' : 'h';
    }
    if (d >= 1) {
        time = d;
        type = resType ? 'time-info.d' : 'd';
    }
    if (w >= 1) {
        time = w;
        type = resType ? 'time-info.w' : 'w';
    }

    return {
        type,
        time
    }
}

export const ANSI = (str) => {
    var htmlStr = str.replace(/\u001b\[\d{1,2}m/g, function(match) {
        var colorCode = match.match(/\d{1,2}/)[0];
        var color = "";
        switch(colorCode) {
          case "30":
            color = "black";
            break;
          case "31":
            color = "red";
            break;
          case "32":
            color = "green";
            break;
          case "33":
            color = "#FFFF00";
            break;
          case "34":
            color = "blue";
            break;
          case "35":
            color = "purple";
            break;
          case "36":
            color = "cyan";
            break;
          case "37":
            color = "white";
            break;
          default:
            color = "inherit";
            break;
        }
        return "<span style='color: " + color + "'>";
      });
      htmlStr = htmlStr.replace(/\u001b\[0m/g, "</span>");
      htmlStr = `<div style="background-color: #1c1c1c4d">${htmlStr}</div>`
      return htmlStr
}

export const covertChain = () => {
  const { chains } = constans();

  let arr = [];
  for (const i in chains) {
      arr.push({
          value: Number(i), 
          label: chains[i].name, 
          icon: chains[i].icon, 
          alias: chains[i]?.alias, 
          link: chains[i].link
      })
  }
  return arr
}