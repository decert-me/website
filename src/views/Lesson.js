import "@/assets/styles/view-style/lesson.scss"
import "@/assets/styles/mobile/view-style/lesson.scss"
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Lesson(params) {
    
    const { t } = useTranslation();
    let [tutorials, setTutorials] = useState([]);

    function init(params) {
        const host = window.location.origin;
        axios.get(`${host}/tutorial/tutorials.json`)
        .then(res => {
            tutorials = res.data;
            setTutorials([...tutorials]);
        })
        .catch(err => {
            console.log(err);
        })
    }

    useEffect(() => {
        init();
    },[])

    return (
        <div className="Lesson">
            <p className="title">{t("header.lesson")}</p>
            {/* <p className="subtitle">{t("header.lesson-sub")}</p> */}
            <div className="content">
                {
                    tutorials.map(e => 
                        <a 
                            href={`https://decert.me/tutorial/${e.catalogueName}/${e.startPage}`} 
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
                            </div>
                        </a>
                    )
                }
                {/* <a href="https://decert.me/tutorial/blockchain-basic/start/" target="_blank" rel="noopener noreferrer">
                <div className="box">
                    <div className="img">
                        <img src={require("@/assets/images/img/lesson-img1.png")} alt="" />
                    </div>
                    <div className="box-content">
                        <p className="box-title">
                            区块链基础
                        </p>
                        <p className="box-desc">
                            区块链是一项令人兴奋且在快速发展的技术，你也许看到过这些频繁在社交媒体、新闻频道上冒出的新名词：智能合约、代币（通证）、Web3、DeFi、DAO 组织。 如果你还不是很明白他们的意思，这份免费区块链基础教程就是为你（小白们）准备的。
                        </p>
                    </div>
                </div>
                </a>

                <a href="https://decert.me/tutorial/solidity/intro/" target="_blank" rel="noopener noreferrer">
                <div className="box">
                    <div className="img">
                        <img src={require("@/assets/images/img/lesson-img2.png")} alt="" />
                    </div>
                    <div className="box-content">
                        <p className="box-title">
                            学习 Solidity
                        </p>
                        <p className="box-desc">
                            Solidity是一种专门为以太坊平台设计的编程语言，它是EVM智能合约的核心，是区块链开发人员必须掌握的一项技能。
                        </p>
                    </div>
                </div>
                </a> */}
            </div>
        </div>
    )
}