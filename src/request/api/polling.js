import pollingAxios from "../polling"

export const pollingGetQuest = (data) => {
    return pollingAxios({
        url: `/v1/quests/${data.id}`,
        method: "get"
    })
}