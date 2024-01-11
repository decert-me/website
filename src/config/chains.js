import { optimism, optimismSepolia, polygon, polygonMumbai } from "viem/chains";


export const CHAINS_DEV = [
    {...polygonMumbai, img: require("@/assets/images/img/net-Polygon.png")}, 
    {...optimismSepolia, img: require("@/assets/images/img/net-Optimism.png")}
]

export const CHAINS = [
    {...polygon, img: require("@/assets/images/img/net-Polygon.png")}, 
    {...optimism, img: require("@/assets/images/img/net-Optimism.png")}
]