Date.prototype.Format = function(fmt) {
    var o = {
      "M+": this.getMonth() + 1, // 月份
      "d+": this.getDate(), // 日
      "h+": this.getHours(), // 小时
      "m+": this.getMinutes(), // 分
      "s+": this.getSeconds(), // 秒
      "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
      S: this.getMilliseconds(), // 毫秒
      // "j+": this.toDateString().split(" ")[1], //月英文
      "F+": this.getHours() > 12 ? 'PM' : 'AM',
      "D+": this.getDate() % 10 > 3 ? "th" : this.getDate() % 10 === 1 ? "st" : this.getDate() % 10 === 2 ? "nd" : "ed",
    };
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        (this.getFullYear() + "").substr(4 - RegExp.$1.length)
      );
    }
    for (var k in o) {
      if (new RegExp("(" + k + ")").test(fmt)) {
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
        );
      }
    }
    return fmt;
  };
  
  export function formatTimeToStrYMD(times, pattern) {
    if (times.toString().length === 10) {
        times = times * 1000
    }
    var d = new Date(times).Format("yyyy-MM-dd");
    if (pattern) {
      d = new Date(times).Format(pattern);
    }
    return d.toLocaleString();
  }

  export function totalTime(time) {
    console.log(time);
    const m = time;    //  分
    const hours = Math.floor(m / 60);
    const mins = m % 60;

    return hours > 0 ? `${hours} h ${mins} m` : `${mins} m`
  }