import { checkQuestInCollection, getCollectionQuest } from '@/request/api/quests';
import { constans } from '@/utils/constans';
import {
    CloseOutlined
} from '@ant-design/icons';
import { Modal } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import CustomLoad from '../CustomLoad';



export default function ModalAirdrop({
    isModalAirdropOpen, 
    closeModal,
    img,
    status,
    isMobile,
    detail,
    airpostLoading
}) {

    const { ipfsPath, defaultImg } = constans();
    const navigateTo = useNavigate();
    const { t } = useTranslation(["claim", "explore"]);
    let [collectionInfo, setCollectionInfo] = useState();

    async function init(params) {
        const data = await checkQuestInCollection({id: detail.tokenId})
        if (data.status === 0 && data.data.is_in_collection) {
            const collection = await getCollectionQuest({id: data.data.collection_id});
            collectionInfo = {
                id: collection.data.collection.id,
                title: collection.data.collection.title
            }
            setCollectionInfo({...collectionInfo});
        }
    }

    useEffect(() => {
        init();
    },[])
    
    return (
        <Modal
            className={`ModalAirdrop ${isMobile ? "ModalAirdrop-mobile" : ""}`}
            open={isModalAirdropOpen}
            onCancel={closeModal}
            footer={null}
            width={isMobile ? "auto" : 500}
            closeIcon={<CloseOutlined style={{fontSize: 15, color: "#000"}} />}
            centered
        >
            {
                airpostLoading ?
                <div className="content">
                    <CustomLoad ml={0} fs={40} />
                </div>
                :
                <div className="content">
                    <div className="img">
                        <img 
                            src={
                                img.split("//")[1]
                                    ? `${ipfsPath}/${img.split("//")[1]}`
                                    : defaultImg
                            } 
                            alt="" 
                        />
                    </div>
                    <p className="text">{status === 2 ? t("explore:pass") : t("explore:airdropping")}</p>
                    {
                        status !== 2 && <p className="tips">{t("explore:airdrop")}</p>
                    }
                    {
                        collectionInfo && <p className="navigateTo">{t("explore:go-to")}&nbsp;<span onClick={() => {navigateTo(`/collection/${collectionInfo.id}`)}}>【{collectionInfo.title}】</span>&nbsp;&gt;&gt;</p>
                    }
                </div>
            }
        </Modal>
    )
}