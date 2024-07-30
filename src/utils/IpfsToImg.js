import { constans } from "./constans";



export const ipfsToImg = (e) => {

    const { defaultImg, ipfsGateway, ipfsPath } = constans();
    let gateway = ipfsGateway;
    const url = e.image_uri;
    const contentType = e.content_type;
    const contractUrl = e.contract_logo;

    if (!url) {
        return <div className="img"><img src={process.env.REACT_APP_NFT_BASE_URL+e.contract_logo} alt="" /></div>
    }else if (!url && !contractUrl) {
        return <div className="img"><img src={defaultImg} alt="" /></div>
    }else {
        switch (contentType) {
            case "image/jpeg":
            case "image/gif":
            case "image/png":
            case "image/webp":
                const src = e.contract_name === "Decert Badge" ? ipfsPath+"/"+url : gateway+url;
                return (
                    <div className="img"><img src={src} alt="" /></div>
                )
            case "image/svg":
                return (
                    <div className="img"><img src={url} alt="" /></div>
                )
            case "video/mp4":
            case "video/quicktime":
                return (
                    <div className="img"><video src={gateway+url} alt="" loop muted autoPlay /></div>
                )
            default:
                return (
                    <div className="img"><img src={process.env.REACT_APP_NFT_BASE_URL+e.contract_logo} alt="" /></div>
                )
        }
    }
}


export const imgTypeCompatible = (url) => {

    const { ipfsGateway } = constans();
    let newUrl = "";
    if (url.indexOf("ipfs://") !== -1) {
        newUrl = ipfsGateway + url.replace("ipfs://", "");
    }else{
        newUrl = process.env.REACT_APP_NFT_BASE_URL + url;
    }

    return newUrl
}