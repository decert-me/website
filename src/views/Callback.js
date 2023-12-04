import { authDiscord } from "@/request/api/social";
import { Spin, message } from "antd";
import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";


export default function Callback() {
    
    const { social } = useParams();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get("code");

    async function init() {
        if (social === "discord") {
            await authDiscord({code, callback: `${window.location.origin}/callback/discord`})
            window.close();
        }
    }

    useEffect(() => {
        init();
    },[])

    return (
        <Spin size="large" />
    )
}