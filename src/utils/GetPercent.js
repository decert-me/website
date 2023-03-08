

export const GetPercent = (total, score) => {
    let num = (score / total);
    let percent = Number(num.toString().match(/^\d+(?:\.\d{0,4})?/)) * 100;
    return percent
}

export const GetScorePercent = (total, score) => {
    let num = (score / total);
    let percent = Number(num.toString().match(/^\d+(?:\.\d{0,4})?/)) * 10000;
    return percent
}