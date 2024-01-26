import { Tooltip } from "antd";
import {
    CONTRACT_ADDR_1155,
    CONTRACT_ADDR_1155_TESTNET,
    CONTRACT_ADDR_721,
    CONTRACT_ADDR_721_TESTNET,
} from "@/config";
import { useAddress } from "@/hooks/useAddress";
import { constans } from "@/utils/constans";

/*
hasNft: Boolean
hasVc: Boolean
info: {
    nft_address, 
    badge_chain_id, 
    badge_token_id, 
    tokenId
}
*/

export default function ChallengeItemIcons({ hasNft, hasVc, info }) {
    const isDev = process.env.REACT_APP_IS_DEV;
    const contract721 = isDev ? CONTRACT_ADDR_721_TESTNET : CONTRACT_ADDR_721;
    const contract1155 = isDev
        ? CONTRACT_ADDR_1155_TESTNET
        : CONTRACT_ADDR_1155;
    const { openseaLink, openseaSolanaLink } = constans();
    const { walletType } = useAddress();

    function toOpensea(event) {
        event.stopPropagation();
        const { nft_address, badge_chain_id, badge_token_id, tokenId } = info;
        let evmLink = openseaLink;
        const solanaLink = `${openseaSolanaLink}/${nft_address}`;
        if (!badge_token_id) {
            evmLink = `${evmLink}/${isDev ? "mumbai" : "matic"}/${contract1155.Badge}/${tokenId}`;
        } else {
            const chainAddr = contract721[badge_chain_id];
            evmLink = `${evmLink}/${chainAddr.opensea}/${chainAddr.Badge}/${badge_token_id}`;
        }
        window.open(walletType === "evm" ? evmLink : solanaLink, "_blank");
    }

    return (
        <div
            style={{
                position: "absolute",
                right: "5px",
                top: "5px",
                display: "flex",
                gap: "5px",
            }}
        >
            {hasNft && (
                <>
                    {/* 链 */}
                    <div
                        className={`opensea img ${isMobile ? "show" : ""}`}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <img
                            src={contract721[info.badge_chain_id]?.img}
                            alt=""
                        />
                    </div>
                    {/* opensea */}
                    <div
                        className={`opensea img ${isMobile ? "show" : ""}`}
                        onClick={toOpensea}
                    >
                        <img
                            src={require("@/assets/images/icon/user-opensea.png")}
                            alt=""
                        />
                    </div>
                </>
            )}
            {hasVc && (
                // zk
                <Tooltip
                    trigger={isMobile ? "focus" : "hover"}
                    title={t("zkTool")}
                >
                    <div
                        className={`opensea img ${isMobile ? "show" : ""}`}
                        onClick={(event) => {
                            event.stopPropagation();
                            // showZk({address: profile.address, token_id: info.tokenId})
                        }}
                    >
                        <img
                            src={require("@/assets/images/icon/user-zk.png")}
                            alt=""
                        />
                    </div>
                </Tooltip>
            )}
        </div>
    );
}
