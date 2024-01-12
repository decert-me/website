import { optimism, polygon } from "viem/chains";


export const CHAINS = [
    {...polygon, img: require("@/assets/images/img/net-Polygon.png"), alias: "Polygon"}, 
    {...optimism, img: require("@/assets/images/img/net-Optimism.png"), alias: "Optimism"}
]

export const CONTRACT_ADDR_721 = {
    Optimism: {
        Badge: "",
        Quest: "",
        BadgeMinter: "",
        QuestMinter: "",
        QuestMetadata: ""
    },
    Polygon: {
        Badge: "",
        Quest: "",
        BadgeMinter: "",
        QuestMinter: "",
        QuestMetadata: ""
    }
}

export const CONTRACT_ADDR_1155 = {
    Badge: "",
    Quest: "",
    QuestMinter: ""
}