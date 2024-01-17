import { optimism, polygon } from "viem/chains";


export const CHAINS = [
    {...optimism, img: require("@/assets/images/img/net-Optimism.png")},
    {...polygon, img: require("@/assets/images/img/net-Polygon.png")}, 
]

export const CONTRACT_ADDR_721 = {
    // optimism
    10: {
        opensea: "optimism",
        Badge: "",
        Quest: "",
        BadgeMinter: "",
        QuestMinter: "",
        QuestMetadata: ""
    },
    // polygon
    137: {
        opensea: "matic",
        Badge: "",
        Quest: "",
        BadgeMinter: "",
        QuestMinter: "",
        QuestMetadata: ""
    }
}

export const CONTRACT_ADDR_1155 = {
    opensea: "matic",
    id: 137,
    Badge: "",
    Quest: "",
    QuestMinter: ""
}