import { optimism, polygon, arbitrum } from "viem/chains";


export const CHAINS = [
    {...optimism, img: require("@/assets/images/img/net-Optimism.png")},
    {...polygon, img: require("@/assets/images/img/net-Polygon.png")}, 
    {...arbitrum, img: require("@/assets/images/img/net-Arbitrum.png")}, 
]

export const CONTRACT_ADDR_721 = {
    // optimism
    10: {
        opensea: "optimism",
        img: require("@/assets/images/img/net-Optimism.png"),
        Badge: "0x176A6AbBd7dFAd4C66d297f40269f910538212b7",
        Quest: "0x373Dcc48Fa23451F792e604ba88c0bfFF17781c8",
        BadgeMinter: "0x0aa319263401eEcecd5Fa2C34636b1057A8B2BFB",
        QuestMinter: "0xE0E5Dc7709d339859DC2793e7afBd74EB29b108b",
        QuestMetadata: "0xC7f03de02a2892E65e0019B8e5b58b6192C929A1"
    },
    // polygon
    137: {
        opensea: "matic",
        img: require("@/assets/images/img/net-Polygon.png"),
        Badge: "0x176A6AbBd7dFAd4C66d297f40269f910538212b7",
        Quest: "0x373Dcc48Fa23451F792e604ba88c0bfFF17781c8",
        BadgeMinter: "0x0aa319263401eEcecd5Fa2C34636b1057A8B2BFB",
        QuestMinter: "0xE0E5Dc7709d339859DC2793e7afBd74EB29b108b",
        QuestMetadata: "0xC7f03de02a2892E65e0019B8e5b58b6192C929A1"
    },
    // arbitrum
    42161: {
        opensea: "arbitrum",
        img: require("@/assets/images/img/net-Arbitrum.png"),
        Badge: "0x176A6AbBd7dFAd4C66d297f40269f910538212b7",
        Quest: "0x373Dcc48Fa23451F792e604ba88c0bfFF17781c8",
        BadgeMinter: "0x0aa319263401eEcecd5Fa2C34636b1057A8B2BFB",
        QuestMinter: "0xE0E5Dc7709d339859DC2793e7afBd74EB29b108b",
        QuestMetadata: "0xC7f03de02a2892E65e0019B8e5b58b6192C929A1"
    }
}

export const CONTRACT_ADDR_1155 = {
    opensea: "matic",
    img: require("@/assets/images/img/net-Polygon.png"),
    id: 137,
    Badge: "0xc8E9cd4921E54c4163870092Ca8d9660e967B53d",
    Quest: "0xEb475aBDD91E07Db399D33F801f5973c7E4B3610",
    QuestMinter: "0x73a02D4ADd0Be83bfa63ceef91905D89CC1214B7"
}