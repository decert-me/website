import { getQuests, hasClaimed } from "@/request/api/public";
import { getCollectionQuest } from "@/request/api/quests";

export const getChallengeList = async (pageParam) => {
    try {
        const res = await getQuests({ pageSize: 10, page: pageParam });
        return res.data?.list || [];
    } catch (error) {
        console.log(error);
        return null;
    }
};

export const getCollection = async (pageParam) => {
    try {
        const res = await getCollectionQuest({ id: pageParam });
        const tokenId = res.data.collection.tokenId;
        let status = false;
        if (tokenId && tokenId !== "0") {
            await hasClaimed({ id: tokenId }).then((res) => {
                status = res.data?.status === 2;
            });
        }
        return {
            list: res.data.list || [],
            collection: res.data.collection,
            status,
        };
    } catch (error) {
        console.log(error);
        return null;
    }
};
