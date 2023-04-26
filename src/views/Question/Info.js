import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Rate } from "antd";
import { getUser } from "@/request/api/public";
import { avatar, nickname } from "@/utils/user";
import CustomViewer from "@/components/CustomViewer";
import { convertTime } from "@/utils/convert";

export default function Info(props) {
    
    const { detail } = props;
    const { t } = useTranslation(["explore","translation","publish"]);
    const navigateTo = useNavigate();
    let [user, setuser] = useState();

    function goChallenge() {
        navigateTo(`/challenge/${detail.tokenId}`)
    }

    function userInit() {
        getUser({address: detail.creator})
        .then(res => {
            user = res?.data;
            setuser({...user});
        })
    }

    useEffect(() => {
        detail && userInit()
    },[detail])

    return(
        user &&
        <div className="quest-info">
            <ul className="info-top">
                <li>
                    <p className="title">创建者</p>
                    <div className="info-content">
                        <div className="img">
                            <img src={avatar(user)} alt="" />
                        </div>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <p className="name">{nickname(user)}</p>
                    </div>
                </li>
                <li>
                    <p className="title">{t("publish:inner.desc")}</p>
                    <div className="info-content desc">
                        {/* <p className="desc">{detail.metadata.description}</p> */}
                        {/* <CustomViewer label={detail.metadata.description} /> */}
                        <CustomViewer label={`🎫 Create a simple NFT to learn basics of 🏗 scaffold-eth. You'll use 👷‍♀️ HardHat to compile and deploy smart contracts. Then, you'll use a template React app full of important Ethereum components and hooks. Finally, you'll deploy an NFT to a public network to share with friends! 🚀
 
🌟 The final deliv, an NFT to a public network to share with f
🎫 Create a simple NFT to learn basics of 🏗 scaffold-eth. You'll use 👷‍♀️ HardHat to compile and deploy smart contracts. Then, you'll use a template React app full of important Ethereum components and hooks. Finally, you'll deploy an NFT to a public network to share with friends! 🚀

🌟 The final deliv, an NFT to a public network to share with f
🎫 Create a simple NFT to learn basics of 🏗 scaffold-eth. You'll use 👷‍♀️ HardHat to compile and deploy smart contracts. Then, you'll use a template React app full of important Ethereum components and hooks. Finally, you'll deploy an NFT to a public network to share with friends! 🚀

🌟 The final deliv, an NFT to a public network to share with f
`} />
                    </div>
                </li>
                <li>
                    <p className="title">奖励</p>
                    <div className="info-content">
                        <p className="reward">SBT</p>
                    </div>
                </li>
                <li>
                    <p className="title">{t("translation:diff")}</p>
                    <div className="info-content">
                        <Rate disabled defaultValue={detail.metadata.properties.difficulty + 1} count={3} />
                    </div>
                </li>
                <li>
                    <p className="title">{t("translation:time")}</p>
                    <div className="info-content">
                        <p className="time">
                        {t(`translation:time-info.${convertTime(detail.metadata.properties.estimateTime).type}`,{time:convertTime(detail.metadata.properties.estimateTime).time})}
                        </p>
                    </div>
                </li>
            </ul>
            <ul className="info-bottom">
                {
                    detail.recommend &&
                    <li>
                        <p className="title">{t("translation:header.lesson")}</p>
                        <div className="recommend desc custom-scroll">
                            <CustomViewer label={detail.recommend} />
                        </div>
                    </li>
                }
                <Button className="submit" onClick={() => goChallenge()}>
                    {t("btn-start")}
                </Button>
            </ul>
        </div>
    )
}