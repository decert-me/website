import { BigNumber } from "ethers";
import BadgeAddress from "@/contracts/Badge.address";


export const constans = () => {

    const chains = {
        "80001": {name: "mumbai", icon: ""},
        "56": {name: "BNB", icon: ""},
        "137": {name: "Polygon", icon: ""},
        "10": {name: "Optimism", icon: ""},
        "1": {name: "Ethereum", icon: ""},
        "42161": {name: "Arbitrum One", icon: ""}
    }

    const maxUint32 = Math.pow(2,32) - 1;
    const maxUint192 = BigNumber.from('2').pow(192).sub(1);
    const openseaLink = `${process.env.REACT_APP_OPENSEA_LINK}/assets/${chains[process.env.REACT_APP_CHAIN_ID].name}/${BadgeAddress}`;
    const defaultImg = 'assets/images/img/default.png';
    const ipfsPath = 'https://ipfs.decert.me';

    return {
        maxUint32,
        maxUint192,
        openseaLink,
        defaultImg,
        ipfsPath,
        chains
    }
}