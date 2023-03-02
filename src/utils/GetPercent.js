

export const GetPercent = (total, score) => {
    let num = (100 / total);
    let percent = Number(num.toString().match(/^\d+(?:\.\d{0,2})?/)) * score;
    return percent
}