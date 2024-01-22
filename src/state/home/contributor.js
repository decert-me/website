import axios from "axios";

export const getContributor = async () => {
    try {
        const res = await axios.get("https://api.decert.me/contributors");
        return res.data
            .split("\n")
            .filter((e) => e !== "")
            .map((line) => {
                const [name, avatar, link] = line.split(",");
                return { name, avatar, link };
            });
    } catch (error) {
        console.log(error);
        return null;
    }
};
