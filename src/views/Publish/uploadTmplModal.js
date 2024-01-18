import { useState } from "react";
import { Button, Menu, Modal } from "antd";
import "./index.scss";


const items = [
    {
        label: "选择一张图片",
        key: "select",
    },
    {
        label: "上传图片",
        key: "upload",
    }
]

const images = [
    "https://ipfs.decert.me/bafkreie4v56uj2g5sgbcnecgp5glujhbks2y27kuffzauf3conep6e6s5i",
    "https://ipfs.decert.me/bafkreid4lhm7bpv3o7ycfk55b64mkl5ahbxjgf6bdvvphk2i4becg7ms3u",
    "https://ipfs.decert.me/bafkreifnkzrxorji6fz7xkyuzkfqxsvi57dmj64lp5varjgkbn2s2ynup4",
]


export default function UploadTmplModal(props) {
 
    const { isModalOpen, handleCancel, showUploadModal, selectTmplImg } = props;
    const [current, setCurrent] = useState('select');

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
                            <img src={e} key={e} alt="" onClick={() => {
                                handleCancel();
                                const fileList = [{
                                    uid: '-1',
                                    name: 'image.png',
                                    status: 'done',
                                    response: {
                                        data: {
                                            hash: e.replace("https://ipfs.decert.me/","")
                                        }
                                    },
                                    thumbUrl: e
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
                    }}>上传图片</Button>
                    <p className="title">Click an image to this area.</p>
                    <p className="tips">The image type must be jpg, png, gif, svg.</p>
                    <p className="tips">Maximum size: 20 MB.</p>
                </div>
            }
        </Modal>
    )
}