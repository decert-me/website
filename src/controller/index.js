import questMinterAddr from "@/contracts/QuestMinter.address";
import questMinter from "@/contracts/QuestMinter.abi";

import badgeAddr from "@/contracts/Badge.address";
import badge from "@/contracts/Badge.abi";
import { ethers } from "ethers";
import { constans } from "@/utils/constans";

// questMinter ===>
export async function createQuest(questData, signature, provider ) {
  
  const Contract = new ethers.Contract(questMinterAddr, questMinter, provider);

  // endTs， supply

  let { startTs, endTs, supply, title, uri } = questData;
  endTs = constans().maxUint32;
  supply = constans().maxUint192;
  // supply = constans().maxUint32;
  const params = [startTs, endTs, supply, title, uri];
  console.log(params);
  let txHash = '';
  try {
    const resp = await Contract.createQuest(params, signature);
    txHash = resp.hash;
  console.log(txHash);

  } catch (err) {
    console.dir(err);
  }
  return txHash;
}

export async function claim(tokenId, score, signature, provider) {
  
  const Contract = new ethers.Contract(questMinterAddr, questMinter, provider);

  let txHash = '';
  try {
    const resp = await Contract.claim(tokenId, score, signature);
    txHash = resp.hash;
  } catch (err) {
    console.dir(err);
  }
  return txHash;
}
  
  
// badge ===>
export async function balanceOf(owner, tokenId, provider) {
  
  const Contract = new ethers.Contract(badgeAddr, badge, provider);

  let txHash = '';
  try {
    const resp = await Contract.balanceOf(owner, tokenId);
    txHash = resp.toNumber();
  } catch (err) {
    console.dir(err);
  }
  return txHash;
}

export async function chainScores(owner, tokenId, provider) {
  
  const Contract = new ethers.Contract(badgeAddr, badge, provider);

  let txHash = '';
  try {
    const resp = await Contract.scores(tokenId, owner);
    txHash = resp.toNumber();
  } catch (err) {
    console.dir(err);
  }
  return txHash;
}
