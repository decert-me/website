import questMinterAddr from "@/contracts/QuestMinter.address";
import questMinter from "@/contracts/QuestMinter.abi";

import badgeAddr from "@/contracts/Badge.address";
import badge from "@/contracts/Badge.abi";
import { ethers } from "ethers";

export async function createQuest(questData, signature, provider ) {
  
  const Contract = new ethers.Contract(questMinterAddr, questMinter, provider);

  const { startTs, endTs, supply, title, uri } = questData;
  const params = [startTs, endTs, supply, title, uri];

  let txHash = '';
  try {
    const resp = await Contract.createQuest(params, signature);
    txHash = resp.hash;
  } catch (err) {
    console.dir(err);
  }
  return txHash;
}
  
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
  
  const Contract = new ethers.Contract(questMinterAddr, questMinter, provider);

  let txHash = '';
  try {
    const resp = await Contract.scores(tokenId, owner);
    txHash = resp.toNumber();
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
  