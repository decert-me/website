

// 初始化realAnswer, 有缓存则和后台对比, 无缓存则添加缓存 ===>
export function localRealAnswerInit(props) {

    const { cacheAnswers, id, detail, reload } = props;

    let flag = false;   //  false: 没有修改 true: 修改了

    if (cacheAnswers?.realAnswer) {
        if (cacheAnswers.realAnswer[id]) {
            // 有缓存: 对比JSON
            if (cacheAnswers.realAnswer[id] !== detail.uri) {
                // 不相等: 清除当前缓存，刷新
                cacheAnswers.realAnswer[id] = detail.uri;
                cacheAnswers[id] = null;
                localStorage.setItem("decert.cache", JSON.stringify(cacheAnswers));
                // 弹出框提示
                reload();

                // 修改了
                flag = true;
            }
        }else{
            // 有缓存，无该题缓存
            cacheAnswers.realAnswer[id] = detail.uri
            localStorage.setItem("decert.cache", JSON.stringify(cacheAnswers));
        }
    }else{
        // 无缓存
        cacheAnswers.realAnswer = {
            [id]: detail.uri
        }
        localStorage.setItem("decert.cache", JSON.stringify(cacheAnswers));
    }

    return {
        cacheAnswers,
        flag
    }
}