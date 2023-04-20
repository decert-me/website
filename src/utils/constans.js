import { BigNumber } from "ethers";
import BadgeAddress from "@/contracts/Badge.address";


export const constans = () => {

    const chains = {
        "80001": {name: "mumbai", alias: "matic", icon: require("@/assets/images/img/net-Polygon.png")},
        "56": {name: "BNB", icon: require("@/assets/images/img/net-BNB.png")},
        "137": {name: "Polygon", icon: require("@/assets/images/img/net-Polygon.png")},
        "10": {name: "Optimism", icon: require("@/assets/images/img/net-Optimism.png")},
        "1": {name: "Ethereum", icon: require("@/assets/images/img/net-ETH.png")},
        "42161": {name: "Arbitrum One", icon: require("@/assets/images/img/net-Arbitrum.png")}
    }
    const chainId = process.env.REACT_APP_CHAIN_ID;

    const maxUint32 = Math.pow(2,32) - 1;
    const maxUint192 = BigNumber.from('2').pow(192).sub(1);
    const openseaLink = `${process.env.REACT_APP_OPENSEA_LINK}/assets/${chains[chainId].name ? chains[chainId].name : chains[process.env.REACT_APP_CHAIN_ID].alias}/${BadgeAddress}`;
    const defaultImg = require('@/assets/images/img/default.png');
    const ipfsPath = 'https://ipfs.decert.me';
    const screenSize = {
        mobile: "(max-width: 480px)",
    }

    return {
        maxUint32,
        maxUint192,
        openseaLink,
        defaultImg,
        ipfsPath,
        chains,
        screenSize
    }
}