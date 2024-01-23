import { getQuests } from "@/request/api/public";

export const getChallengeList = async (pageParam) => {
    try {
        const res = await getQuests({pageSize: 10, page: pageParam});
        return res.data?.list || []
    } catch (error) {
        console.log(error);
        return null;
    }
};
