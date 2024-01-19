import { getDidCardInfo } from "@/request/api/zk";
import { downloadJsonFile } from "@/utils/file/downloadJsonFile";
import { useUpdateEffect } from "ahooks";
import { Modal } from "antd";
import axios from "axios";
import { useState } from "react";



export default function ModalZkCard(props) {

    const { isModalOpen, handleCancel, isMobile } = props;

    let [info, setInfo] = useState();
    let [cert, setCert] = useState();
    let [media, setMedia] = useState();
    
    function downloadCert() {
        downloadJsonFile(cert, `vc-${info.ChallengeID}`)
    }

    async function init() {
        try {
            const res = await getDidCardInfo(isModalOpen)
            await axios.get(`https://ipfs.decert.me/${res.data.credentialSubject.Content.replace("ipfs://","")}`)
            .then(res => {
                if (res.data?.properties?.media) {                    
                    media = res.data.properties.media;
                }else{
                    media = "https://ipfs.decert.me/bafkreid4lhm7bpv3o7ycfk55b64mkl5ahbxjgf6bdvvphk2i4becg7ms3u";
                }
                setMedia(media);
            })
            cert = res.data;
            setCert({...cert});
            info = res.data.credentialSubject;
            setInfo({...info});
        } catch (error) {
            console.log(error);
        }
    }

    useUpdateEffect(() => {
        isModalOpen && init();
    },[isModalOpen])

    return (
        <Modal
            className={`ModalZkCard ${isMobile ? "ModalZkCard-mobile" : ""}`}
            open={isModalOpen}
            onCancel={() => {
                setInfo(null);
                setCert(null);
                setMedia(null);
                handleCancel();
            }}
            footer={null}
            width={890}
            closeIcon={<></>}
            centered
        >
            <div className="zkCard-content">
                <div className="zkCard-item">
                    <div className="card">
                        <div className="card-inner">
                            <p className="newline-omitted">{info?.Title}</p>
                        </div>
                        {
                            media && <img src={media.replace("ipfs://", "https://ipfs.decert.me/")} className="card-bg" alt="" />
                        }
                    </div>
                    <div className="params-list">
                        <div className="params">
                            <p className="label">Title</p>
                            <p className="desc">{info?.Title}</p>
                        </div>
                        <div className="params">
                            <p className="label">Challenge ID</p>
                            <div className="desc">{info?.ChallengeID}</div>
                        </div>
                        <div className="params row">
                            <p className="label">Pass</p>
                            <div className="status">{info?.Pass ? "True" : "False"}</div>
                        </div>
                        <div className="params row">
                            <p className="label">Score</p>
                            <p className="desc">{info?.Score}</p>
                        </div>
                        <div className="params">
                            <p className="label">Content</p>
                            <p className="desc">{info?.Content}</p>
                        </div>
                    </div>
                </div>
                <div className="zkCard-item">
                    <div className="list">
                        <div className="item">
                            <p className="label">DESCRIPTION</p>
                            <div className="desc">Congratulate on pass the challenge.</div>
                        </div>
                        <div className="item">
                            <p className="label">CARD INFO</p>
                            <ul>
                                <li>
                                    <p className="li-label">TEMPLATE ID</p>
                                    <p className="li-desc">260</p>
                                </li>
                                <li>
                                    <p className="li-label">EXPIRE TIME</p>
                                    <p className="li-desc">Permanent</p>
                                </li>
                                <li>
                                    <p className="li-label">ISSUER</p>
                                    <p className="li-desc">{cert && cert.issuer[0].substring(0,11) + "..." + cert.issuer[0].substring(cert.issuer[0].length - 4, cert.issuer[0].length)}</p>
                                </li>
                                <li>
                                    <p className="li-label">CATEGORY</p>
                                    <p className="li-desc">Achievement</p>
                                </li>
                            </ul>
                        </div>
                        <div className="item">
                            <p className="label">DATA FIELD HASH</p>
                            <div className="desc">{cert && cert.ctype}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="zkCard-btns">
                <button onClick={downloadCert}>
                    <img src={require("@/assets/images/icon/icon-download.png")} alt="" />
                </button>
            </div>
        </Modal>
    )
}