import { useTranslation } from "react-i18next";

export default function CustomSocial(props) {
    
    const { t } = useTranslation(["profile"]);
    const { socials } = props;

    const list = {
        discord: {
            img: require("@/assets/images/img/discord-block.png"),
            title: "Discord"
        },
        wechat: {
            img: require("@/assets/images/img/wechat.png"),
            title: "WeChat"
        },
        github: {
            img: require("@/assets/images/icon/icon-github.png"),
            title: "Github"
        },
        email: {
            img: require("@/assets/images/icon/email.png"),
            title: "Email"
        }
    }
    // [
    //     { 
    //         label: "discord", 
    //         none: require("@/assets/images/img/discord-none.png"), 
    //         block: require("@/assets/images/img/discord-block.png") 
    //     }
    // ]
    
    return (
        <>
            {
                socials && 
                Object.keys(socials).map((e, i) => 
                    <div className="social-item" key={i}>
                        <div className="icon img">
                            <img src={list[e].img} alt="" />
                        </div>
                        {t(list[e].title)}
                    </div>    
                )
            }
        </>
    )
}