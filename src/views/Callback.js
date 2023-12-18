import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Spin } from "antd";
import { LoadingOutlined } from '@ant-design/icons';
import { authDiscord } from "@/request/api/social";

export default function Callback() {
    
    const { social } = useParams();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get("code");

    async function init() {
        const token = localStorage.getItem("decert.token");
        if (!code) {
            window.close();
            return
        }
        if (social === "discord" && token) {
            await authDiscord({code, callback: `${window.location.origin}/callback/discord`})
            .then(res => {
                if (res?.message) {
                    localStorage.setItem("decert.bind.notice", res.message);
                }
            })
            setTimeout(() => {
                window.close();
            }, 40);
        }
    }

    useEffect(() => {
        init();
    },[])

    return (
        <div style={{
            width: "100vw",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <Spin 
                indicator={
                    <LoadingOutlined
                      style={{
                        fontSize: "5rem",
                      }}
                      spin
                    />
                }
            />
        </div>
    )
}