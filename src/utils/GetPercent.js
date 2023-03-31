import Big from "big.js";


export const GetPercent = (total, score) => {

    let newTotal = new Big(total);
    let newScore = new Big(score);
    let num = newScore.div(newTotal).toString();

    let newNum = new Big(num.match(/^\d+(?:\.\d{0,4})?/));
    let percent = newNum.times(100).toString();

    return percent
}

export const GetScorePercent = (total, score) => {
    let newTotal = new Big(total);
    let newScore = new Big(score);
    let num = newScore.div(newTotal).toString();

    let newNum = new Big(num.match(/^\d+(?:\.\d{0,4})?/));
    let percent = newNum.times(10000).toString();

    return percent
}