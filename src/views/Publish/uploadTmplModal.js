import { useState } from "react";
import { Button, Menu, Modal } from "antd";
import "./index.scss";
import { useTranslation } from "react-i18next";

const images = [
    {
        img: "https://ipfs.decert.me/bafkreid4lhm7bpv3o7ycfk55b64mkl5ahbxjgf6bdvvphk2i4becg7ms3u",
        path: require("@/assets/images/img/zk-card2.png")
    },
    {
        img: "https://ipfs.decert.me/bafkreie4v56uj2g5sgbcnecgp5glujhbks2y27kuffzauf3conep6e6s5i",
        path: require("@/assets/images/img/zk-card1.png")
    },
    {
        img: "https://ipfs.decert.me/bafkreifnkzrxorji6fz7xkyuzkfqxsvi57dmj64lp5varjgkbn2s2ynup4",
        path: require("@/assets/images/img/zk-card3.png")
    }
]


export default function UploadTmplModal(props) {
 
    const { isModalOpen, handleCancel, showUploadModal, selectTmplImg } = props;
    const [current, setCurrent] = useState('select');
    const { t } = useTranslation(["publish"]);

    const items = [
        {
            label: t("inner.content.img.menu-choose"),
            key: "select",
        },
        {
            label: t("inner.content.img.upload"),
            key: "upload",
        }
    ]

    return (
        <Modal
            className="ModalUpload" 
            open={isModalOpen}
            onCancel={handleCancel}
            footer={null}
            width={436}
            centered
        >
            <Menu
                onClick={(e) => setCurrent(e.key)} 
                selectedKeys={[current]} 
                mode="horizontal" 
                items={items} 
            />
            {
                current === "select" &&
                <div className="img-list">
                    {
                        images.map(e => (
                            <img src={e.img} key={e.img} alt="" onClick={() => {
                                handleCancel();
                                const fileList = [{
                                    uid: '-1',
                                    name: 'image.png',
                                    status: 'done',
                                    response: {
                                        data: {
                                            hash: e.img.replace("https://ipfs.decert.me/","")
                                        }
                                    },
                                    thumbUrl: e.img,
                                    path: e.path
                                }];
                                selectTmplImg(fileList);
                            }}/>
                        ))
                    }
                </div>
            }
            {
                current === "upload" &&
                <div className="img-upload">
                    <Button onClick={async() => {
                        await handleCancel();
                        showUploadModal();
                    }}>{t("inner.content.img.upload")}</Button>
                    <p className="title">{t("inner.content.img.p1")}</p>
                    <p className="tips">{t("inner.content.img.p2")}</p>
                    <p className="tips">{t("inner.content.img.p3")}</p>
                </div>
            }
        </Modal>
    )
}