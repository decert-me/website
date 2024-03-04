import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import { ExportOutlined } from '@ant-design/icons';
import { constans } from "@/utils/constans";
import MyContext from "@/provider/context";
import Challenger from "./Challenger";
import Info from "./Info";


export default function Content({detail, questId, isPreview}) {

    const navigateTo = useNavigate();
    const { t } = useTranslation(["explore", "translation"]);
    const { isMobile } = useContext(MyContext);
    const { ipfsPath, defaultImg } = constans();

    return (
        <div className="Question">
            {
                detail.preview &&
                <div className="preview-head">
                    <Button className="btn-exit" onClick={() => {questId ? navigateTo(`/publish?${questId}`) : navigateTo("/publish")}}>
                        <ExportOutlined className='icon' />
                        {t("btn-exit")}
                    </Button>
                </div>
            }
            <div className="custom-bg-round"></div>
            <h1>{detail.title}</h1>
            <div className="content">
                <div className="content-left">
                    <div className="quest-title">
                        <div className="img challenge-img">
                            <img 
                                src={
                                    detail.metadata.image.split("//")[1]
                                    ? `${ipfsPath}/${detail.metadata.image.split("//")[1]}`
                                    : defaultImg
                                }
                                style={detail?.version === "2" ? {width: "100%", height: "100%"} : {}}
                                alt="" />
                            {/* 阴影文本: ERC-721展示 */}
                            {
                                detail?.version === "2" &&
                                <div className="img-mask">
                                    <p className="newline-omitted">{detail.title}</p>
                                </div>
                            }
                        </div>
                    </div>
                    {
                        !isMobile &&
                        <Challenger questId={isPreview ? null : questId} />
                    }
                </div>
                <div className="content-right">
                    <Info detail={detail} questId={questId}/>
                </div>
                {
                    isMobile && 
                    <>
                        <div className="line"></div>
                        <Challenger questId={isPreview ? null : questId} />
                    </>
                }
            </div>
        </div>
    )
}