import "@/assets/styles/view-style/lesson.scss"
import "@/assets/styles/mobile/view-style/lesson.scss"
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAccount } from "wagmi";
import { tutorialProgress } from "@/request/api/public";

export default function Lesson(params) {
    
    const { t } = useTranslation();
    const { address } = useAccount();
    let [tutorials, setTutorials] = useState([]);

    async function getProgress(params) {
        for (let i = 0; i < tutorials.length; i++) {
            await tutorialProgress({catalogueName: tutorials[i].catalogueName})
            .then(res => {
                if (res?.status === 0) {
                    const data = res.data.data;
                    let sum = 0;
                    data.forEach(element => {
                        element.is_finish && sum++
                    });
                    tutorials[i].progress = (sum / data.length * 100).toFixed(0)
                }
            })
        }
        setTutorials([...tutorials]);
    }

    function init(params) {
        // const host = window.location.origin;
        // axios.get(`${host}/tutorial/tutorials.json`)
        // .then(res => {
        //     tutorials = res.data;
        //     setTutorials([...tutorials]);
        // })
        // .catch(err => {
        //     console.log(err);
        // })
        tutorials = [
            {
                "repoUrl": "https://github.com/decert-me/blockchain-basic",
                "label": "区块链基础",
                "startPage": "start",
                "catalogueName": "blockchain-basic",
                "docType": "docusaurus",
                "img": "https://ipfs.decert.me/images/blockchain-basic.png",
                "desc": "区块链是一项令人兴奋且在快速发展的技术，你也许看到过这些频繁在社交媒体、新闻频道上冒出的新名词：智能合约、代币（通证）、Web3、DeFi、DAO 组织。 如果你还不是很明白他们的意思，这份免费区块链基础教程就是为你（小白们）准备的。"
            },
            {
                "repoUrl": "https://github.com/decert-me/learnsolidity",
                "label": "学习 Solidity",
                "startPage": "intro",
                "catalogueName": "solidity",
                "img": "https://ipfs.decert.me/images/learn-solidity.png",
                "desc": "Solidity是一种专门为以太坊平台设计的编程语言，它是EVM智能合约的核心，是区块链开发人员必须掌握的一项技能。",
                "docType": "docusaurus"
            },
            {
                "repoUrl": "https://github.com/SixdegreeLab/MasteringChainAnalytics",
                "label": "成为链上数据分析师",
                "startPage": "README",
                "catalogueName": "MasteringChainAnalytics",
                "img": "https://ipfs.learnblockchain.cn/images/sixdegree.png",
                "desc": "本教程是一个面向区块链爱好者的系列教程，帮助新手用户从零开始学习区块链数据分析，成为一名链上数据分析师。",
                "docType": "gitbook",
                "challenge": 10004
            }
        ]
        setTutorials([...tutorials]);
    }

    useEffect(() => {
        init();
    },[])

    useEffect(() => {
        address && getProgress()
    },[address])

    return (
        <div className="Lesson">
            <div className="custom-bg-round" />
            <p className="title">{t("header.lesson")}</p>
            <div className="content">
                {
                    tutorials.map(e => 
                        <a 
                            href={`https://decert.me/tutorial/${e.catalogueName}${/^README$/i.test(e.startPage) ? "/" : "/"+e.startPage}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            key={e.catalogueName}
                        >
                            <div className="box">
                                <div className="img">
                                    <img src={e?.img?.indexOf("http") === -1 ? require(`@/${e.img}`) : e.img} alt="" />
                                </div>
                                <div className="box-content">
                                    <p className="box-title">
                                        {e.label}
                                    </p>
                                    <p className="box-desc">
                                        {e?.desc}
                                    </p>
                                </div>
                                {
                                    e?.progress &&
                                    <div className="progress">
                                        {t("progress")} {e.progress}%
                                    </div>
                                }
                            </div>
                        </a>
                    )
                }
            </div>
        </div>
    )
}