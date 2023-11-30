import { constans } from "@/utils/constans";



export default function CollectionNft(props) {
    
    const { detail, isCreated } = props
    const { ipfsPath, defaultImg, openseaLink } = constans(null, detail.version);

    return(
        <div className="nft">
            <div className="img">
                <img 
                    src={
                        detail.collection.cover
                        ? `${ipfsPath}/${detail.collection.cover}`
                        : defaultImg
                    }
                    alt="" />
                {
                    isCreated && detail?.collection.claimed &&
                    <a 
                        target="_blank"
                        href={openseaLink+"/"+detail?.collection.badge_token_id} 
                        className="badge">
                        <img src={require("@/assets/images/icon/opensea.png")} alt="" />
                    </a>
                }
            </div>
        </div>
    )
}