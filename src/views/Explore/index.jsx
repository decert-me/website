import { Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import PageLoader from "@/components/Loader/PageLoader";
import ChallengeItem from "@/components/ChallengeItem";
import ChallengeItems from "@/components/ChallengeItem/ChallengeItems";
import { getChallengeList } from "@/state/explore/challenge";
import "./style/index.scss";
import "./style/mobile.scss";


export default function Explore(params) {
    const navigateTo = useNavigate();
    const { t } = useTranslation(["explore", "translation"]);
    const { data, fetchNextPage, hasNextPage, status } = useInfiniteQuery({
        queryKey: ["challenges"],
        queryFn: ({ pageParam }) => getChallengeList(pageParam),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length > 0 ? allPages.length + 1 : undefined;
        },
    });

    return (
        <div className="Explore">
            <div className="custom-bg-round"></div>
            <h3>{t("title")}</h3>
            <InfiniteScroll
                className="challenges"
                dataLength={data?.pages.flat().length || 0}
                next={fetchNextPage}
                hasMore={hasNextPage}
                loader={<Spin size="large" className="loading" />}
            >
                {status === "pending" ? (
                    <PageLoader />
                ) : (
                    data.pages
                        .flat()
                        .map((item) =>
                            item.style === 1 ? (
                                <ChallengeItem 
                                    key={item.id}
                                    info={item} 
                                    claimedInfo={{
                                        hasNft: item.claim_status === 1 || item.claim_status === 3,
                                        hasVc: item.claim_status === 2 || item.claim_status === 3,
                                        info: {
                                            version: item.version,
                                            title: item.title,
                                            nft_address: item?.nft_address,
                                            badge_chain_id: item?.badge_chain_id,
                                            badge_token_id: item?.badge_token_id,
                                        }
                                    }}
                                />
                            ) : (
                                <ChallengeItems
                                    key={item.id}
                                    info={item}
                                    goCollection={(id) => navigateTo(`/collection/${id}`)}
                                />
                            )
                        )
                )}
            </InfiniteScroll>
        </div>
    );
}
