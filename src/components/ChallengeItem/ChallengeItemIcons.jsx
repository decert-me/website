import { Tooltip } from "antd";


/*
hasNft: Boolean
hasVc: Boolean
*/
export default function ChallengeItemIcons({
    hasNft,
    hasVc
}) {

    function name(params) {
        
    }
    
    return (
        <div style={{
            position: "absolute",
            right: "5px",
            top: "5px",
            display: "flex",
            gap: "5px"
        }}>
            {
                hasNft &&
                <>
                    {/* 链 */}
                    <div className={`opensea img ${isMobile ? "show" : ""}`} onClick={(event) => event.stopPropagation()}>
                        <img src={isDev ? CONTRACT_ADDR_721_TESTNET[info.badge_chain_id]?.img: CONTRACT_ADDR_721[info.badge_chain_id].img} alt="" />
                    </div>
                    {/* opensea */}
                    <div className={`opensea img ${isMobile ? "show" : ""}`} onClick={toOpensea}>
                        <img src={require("@/assets/images/icon/user-opensea.png")} alt="" />
                    </div>
                </>
            }
            {
                hasVc &&
                // zk
                <Tooltip
                    trigger={isMobile ? "focus" : "hover"}
                    title={t("zkTool")}
                >
                    <div 
                    className={`opensea img ${isMobile ? "show" : ""}`}
                    onClick={(event) => {
                        event.stopPropagation();
                        showZk({address: profile.address, token_id: info.tokenId})
                    }}>
                        <img src={require("@/assets/images/icon/user-zk.png")} alt="" />
                    </div>
                </Tooltip>
            }
        </div>
    )
}