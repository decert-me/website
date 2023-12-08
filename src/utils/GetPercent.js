import BigNumber from "bignumber.js";

export const GetPercentScore = (score, percent) => {
  const num1 = new BigNumber(score);
  const num2 = new BigNumber(percent);

  const result = num1.times(num2);

  return Number(result);
}

export const GetPercent = (total, score) => {
  const newTotal = new BigNumber(total);
  const newScore = new BigNumber(score);

  // 使用 bignumber.js 进行精确的除法运算
  const num = newScore.dividedBy(newTotal).toString();

  // 使用正则表达式匹配数字部分，并限制小数点后最多四位
  const newNum = new BigNumber(num.match(/^\d+(?:\.\d{0,4})?/));
  const percent = newNum.times(100).toString();

  return Number(percent);
};

export const GetScorePercent = (total, score) => {
  const newTotal = new BigNumber(total);
  const newScore = new BigNumber(score);

  // 使用 bignumber.js 进行精确的除法运算
  const num = newScore.dividedBy(newTotal).toString();

  // 使用正则表达式匹配数字部分，并限制小数点后最多四位
  const newNum = new BigNumber(num.match(/^\d+(?:\.\d{0,4})?/));
  const percent = newNum.times(10000).toString();

  return Number(percent);
};
