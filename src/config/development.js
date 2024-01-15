import { optimismSepolia, polygonMumbai } from "viem/chains";


export const CHAINS_TESTNET = [
    {...optimismSepolia, img: require("@/assets/images/img/net-Optimism.png")},
    {...polygonMumbai, img: require("@/assets/images/img/net-Polygon.png")}, 
]

export const CONTRACT_ADDR_721_TESTNET = {
    11155420: {
        opensea: "optimism-sepolia",
        img: require("@/assets/images/img/net-Optimism.png"),
        Badge: "0xEd4d0d78cAd46fFa2dD7eb4826694FC9C489E489",
        Quest: "0x81475ae2C65b619C754DA93BFE3f9e43115DEe3d",
        BadgeMinter: "0xEdC46868f04d482f04A8c29E915aBED72C03cD35",
        QuestMinter: "0xdD07B70B610B350cDac4DcE74D59342c8a6F1A17",
        QuestMetadata: "0xC15875D3987CB6d92208a4625e0034D77195B73b"
    },
    80001: {
        opensea: "mumbai",
        img: require("@/assets/images/img/net-Polygon.png"),
        Badge: "0xc2bb6Ab14E291B078B76b17925576CC24AA03405",
        Quest: "0x7d8Ded1bb82cA089Ee79b4C3cAc8967AC04C33e8",
        BadgeMinter: "0xbb279dDffC1b03FC4a6c8eB601C1CbdaA46e89d4",
        QuestMinter: "0x1B47FC1F3EF613e44C8BfF9e4ca1357380d411A7",
        QuestMetadata: "0x5dd7b77e51b65ad1818374F3b66Fc19f82154f87"
    }
}

export const CONTRACT_ADDR_1155_TESTNET = {
    opensea: "mumbai",
    img: require("@/assets/images/img/net-Polygon.png"),
    id: 80001,
    Badge: "0x66C54CB10Ef3d038aaBA2Ac06d2c25B326be8142",
    Quest: "0x020ef5c45182019A5aa48A8dD089a3712ad491b4",
    QuestMinter: "0xEdC46868f04d482f04A8c29E915aBED72C03cD35"
}