import { BigNumber } from "ethers";
const BadgeAddress = process.env.REACT_APP_CONTRACT_BADGE_ADDRESS;


export const constans = () => {

    const chains = {
        "80001": "mumbai",
    }

    const maxUint32 = Math.pow(2,32) - 1;
    const maxUint192 = BigNumber.from('2').pow(192).sub(1);
    const openseaLink = `https://testnets.opensea.io/assets/${chains[process.env.REACT_APP_CHAIN_ID]}/${BadgeAddress}`;
    const defaultImg = 'assets/images/img/default.png';
    const ipfsPath = 'http://ipfs.learnblockchain.cn';

    return {
        maxUint32,
        maxUint192,
        openseaLink,
        defaultImg,
        ipfsPath
    }
}