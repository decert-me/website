import { submitChallenge } from "@/request/api/public";

export async function submitClaimable(params) {
    // submitChallenge
    const local = localStorage.getItem("decert.cache");
    if (local) {
        let cache = JSON.parse(local);
        // 有可领取的挑战
        if (cache?.claimable && cache.claimable.length !== 0) {
            for (let i = 0; i < cache.claimable.length; i++) {
                const quest = cache.claimable[i];
                const data = cache[quest.token_id];
                await submitChallenge({
                    token_id: quest.token_id,
                    answer: JSON.stringify(data),
                    uri: cache.realAnswer[quest.token_id]
                })
                .then(res => {
                    delete cache[quest.token_id]
                })
            }
            cache.claimable = [];
            cache.realAnswer = [];
            localStorage.setItem("decert.cache", JSON.stringify(cache));
        }
    }
}