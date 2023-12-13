import Big from "big.js";


export const GetPercentScore = (score, percent) => {
  // const num1 = new BigNumber(score);
  // const num2 = new BigNumber(percent);
  let num1 = new Big(score);
  let num2 = new Big(percent);

  const result = num1.times(num2);

  return Number(result);
}

export const GetPercent = (total, score) => {

    let newTotal = new Big(total);
    let newScore = new Big(score);
    let num = newScore.div(newTotal).toString();

    let newNum = new Big(num.match(/^\d+(?:\.\d{0,4})?/));
    let percent = newNum.times(100).toString();

    return Number(percent)
}

export const GetScorePercent = (total, score) => {
    let newTotal = new Big(total);
    let newScore = new Big(score);
    let num = newScore.div(newTotal).toString();

    let newNum = new Big(num.match(/^\d+(?:\.\d{0,4})?/));
    let percent = newNum.times(10000).toString();

    return Number(percent)
}