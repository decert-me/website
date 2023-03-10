import { Button } from "antd";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getQuests } from "../request/api/public";
import "@/assets/styles/view-style/question.scss"
import { hashAvatar } from "../utils/HashAvatar";
import { convertDifficulty, convertTime } from "../utils/convert";
import { NickName } from "../utils/NickName";


export default function Quests(params) {
    
    const location = useLocation();

    let [detail, setDetail] = useState();

    const getData = (id) => {
        getQuests({id: id})
        .then(res => {
            detail = res ? res.data : {};
            setDetail({...detail});
        })
    }

    useEffect(() => {
        const id = location?.pathname?.split("/")[2];
        id && getData(id);
    }, []);

    return (
        detail &&
        <>
            <h1 className="quests-title">{detail.title}</h1>
            <div className="Question">
                <div className="question-content">
                    <div className="img">
                        <img 
                            src={
                                detail.metadata.image.split("//")[1]
                                    ? `http://ipfs.learnblockchain.cn/${detail.metadata.image.split("//")[1]}`
                                    : 'assets/images/img/default.png'
                            }
                            alt="" />
                    </div>
                    <div className="content">
                        <p className="desc">{detail.description}</p>
                        <div>
                            <h3>技术认证</h3>
                            <p className="desc">
                                完成挑战，可获得SBT（灵魂绑定代币）作为技术能力的证明。分享到你的社交平台，让世界知道你的能力。
                            </p>
                        </div>
                    </div>
                </div>
                <div className="question-bottom">
                    <ul>
                        <li>
                            <div className="img">
                                <img src={hashAvatar(detail.creator)} alt="" />
                            </div>
                            <p>{NickName(detail.creator)}</p>
                        </li>
                            
                        {
                            detail.metadata.properties.difficulty !== null &&
                            <li>
                                难度: {convertDifficulty(detail.metadata.properties.difficulty)}
                            </li>
                        }
                        {
                            detail.metadata.properties.estimateTime &&
                            <li>
                                预估时间: {convertTime(detail.metadata.properties.estimateTime)}
                            </li>
                        }
                    </ul>
                    <Link to={`/challenge/${detail.tokenId}`}>
                        <Button>开始挑战</Button>
                    </Link>
                </div>
            </div>
        </>
    )
}