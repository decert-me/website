import { optimism, polygon } from "viem/chains";


export const CHAINS = [
    {...optimism, img: require("@/assets/images/img/net-Optimism.png")},
    {...polygon, img: require("@/assets/images/img/net-Polygon.png")}, 
]

export const CONTRACT_ADDR_721 = {
    10: {
        Badge: "",
        Quest: "",
        BadgeMinter: "",
        QuestMinter: "",
        QuestMetadata: ""
    },
    137: {
        Badge: "",
        Quest: "",
        BadgeMinter: "",
        QuestMinter: "",
        QuestMetadata: ""
    }
}

export const CONTRACT_ADDR_1155 = {
    id: 137,
    Badge: "",
    Quest: "",
    QuestMinter: ""
}