import { BigNumber } from "ethers";
import BadgeAddress from "@/contracts/Badge.address";


export const constans = () => {

    const maxUint32 = Math.pow(2,32) - 1;
    const maxUint192 = BigNumber.from('2').pow(192).sub(1);
    const openseaLink = `https://testnets.opensea.io/assets/${process.env.REACT_APP_CHAIN_NAME}/${BadgeAddress}`;
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