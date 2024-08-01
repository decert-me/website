import { CONTRACT_ADDR_721, CONTRACT_ADDR_721_TESTNET } from "@/config";
import { constans } from "@/utils/constans";


export default function OpenseaIcon({chain_id, tokenId}) {
    
    const { openseaLink } = constans();
    const isDev = process.env.REACT_APP_IS_DEV;
    const config = isDev ? CONTRACT_ADDR_721_TESTNET : CONTRACT_ADDR_721;

    return (
        <a 
            target="_blank"
            href={openseaLink+"/"+config[chain_id].opensea+"/"+config[chain_id].Badge+"/"+tokenId} 
            className="badge">
            <img src={require("@/assets/images/icon/opensea.png")} alt="" />
        </a>
    )
}