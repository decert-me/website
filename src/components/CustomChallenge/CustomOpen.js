import { useTranslation } from "react-i18next";
import { Button, Input, Modal, Rate, Space, Upload, message } from "antd";
import { UploadOutlined } from '@ant-design/icons';
import CustomViewer from "../CustomViewer";
import { uploadFile } from "@/request/api/public";
import { useContext, useEffect, useState } from "react";
import { useAddress } from "@/hooks/useAddress";
import MyContext from "@/provider/context";
import CustomIcon from "../CustomIcon";

const { TextArea } = Input;

export default function CustomOpen(props) {
    
    const { label, value, defaultValue, defaultFileList, question } = props;
    const { connectWallet } = useContext(MyContext);
    const { t } = useTranslation(["explore"]);
    const { isConnected } = useAddress();
    const [annotationModal, setAnnottaionModal] = useState(false);
    const [answerModal, setAnswerModal] = useState(false);
    let [annex, setAnnex] = useState([]);
    let [inner, setInner] = useState("");


    const upload = {
        name: 'file',
        headers: {
          authorization: 'authorization-text',
        },
        customRequest({
            data,
            file,
            filename,
            onError,
            onSuccess
        }) {
            const formData = new FormData();
            if (data) {
                Object.keys(data).forEach(key => {
                formData.append(key, data[key]);
                });
            }
            formData.append('file', file);
            uploadFile(formData)
            .then(res => {
                // 成功后将对象写入annex数组对象中 => {后缀、ipfs链接}
                if (res.status === 0) {                    
                    message.success(res.message);
                    annex = [{
                        name: file.name,
                        hash: "https://ipfs.decert.me/" + res.data.hash
                    }]
                    setAnnex([...annex]);
                    onChangeValue();
                    onSuccess(res, file);
                }else{
                    message.error(res.message);
                    onError();
                }
            })
            .catch(err => {
                console.log(err);
            });

            return {
                abort() {
                  console.log("upload progress is aborted.");
                }
            };
        },
        beforeUpload(file) {
            if (!isConnected) {
                connectWallet();
                return Upload.LIST_IGNORE
            }
            const isLt100M = file.size / 1024 / 1024 < 20;
            if (!isLt100M) {
              message.error("Image must smaller than 20MB!");
              return Upload.LIST_IGNORE
            }
        }
    };

    // 修改缓存
    function onChangeValue() {
        value(inner, "open_quest", annex);
    }

    // 修改文本答案
    function changeInner(value) {
        inner = value;
        setInner(inner);
        onChangeValue();
    }
    
    function openAnnotation() {
        setAnnottaionModal(true);
    }

    function openAnswer() {
        setAnswerModal(true);
    }

    function init() {
        // const fileList = [];
        // const {annex: arr} = defaultValue;
        // arr.forEach((file, i) => {
        //     fileList.push({
        //         uid: i,
        //         name: file.name,
        //         status: 'done',
        //         url: file.hash,
        //     })
        // })
        // defaultFileList = fileList;
        // setDefaultFileList([...defaultFileList]);
        annex = defaultFileList;
        setAnnex([...annex]);
    }

    useEffect(() => {
        defaultValue && init();
    },[])

    return (
        <div className="CustomInput">
            <Modal
                width={987}
                open={annotationModal}
                onCancel={() => setAnnottaionModal(false)}
                footer={<></>}
                className="annotationModal"
            >
                <p className="title">批注</p>
                <TextArea 
                    className="box"
                    readOnly
                    bordered={false} 
                    value={defaultValue?.annotation}
                    maxLength={2000}
                    autoSize={{ minRows: 7 }}
                />
                <div className="btns">
                    <Button id="hover-btn-full" onClick={() => setAnnottaionModal(false)}>我知道了</Button>
                </div>
            </Modal>
            <Modal
                open={answerModal}
                onCancel={() => setAnswerModal(false)}
                footer={<></>}
                className="answerModal"
                width={1560}
            >
                <p className="title text-center">上次答案</p>
                <div className="box mh480">
                    <div className="last-rate">
                        <p>上次得分：</p>
                        <Rate
                            allowHalf
                            disabled
                            value={defaultValue?.value ? (defaultValue.score / question.score) * 5 : 0}
                            style={{ color: "#DD8C53" }}
                            character={
                                <CustomIcon
                                    type="icon-star"
                                    className="icon"
                                />
                            }
                        />
                    </div>
                    <TextArea 
                        className="box"
                        readOnly
                        bordered={false} 
                        value={defaultValue?.value}
                        style={{borderRadius: 0}}
                        maxLength={2000}
                        autoSize={{ minRows: 7 }}
                    />
                </div>
                <div className="btns">
                    <Button id="hover-btn-full" onClick={() => setAnswerModal(false)}>我知道了</Button>
                </div>
            </Modal>
            <div className="inner-title">
                <CustomViewer label={label} />
            </div>
            <div className="CustomInput-content">
            
                <div className="check-item">
                    <div onClick={() => openAnnotation()}><img src={require("@/assets/images/icon/icon-annotation.png")} />查看批注</div>
                    <div onClick={() => openAnswer()}><img src={require("@/assets/images/icon/icon-answer.png")} />查看上次答案</div>
                </div>
                <TextArea 
                    className={`custom-input bd mh`} 
                    bordered={false} 
                    onChange={e => changeInner(e.target.value)}  
                    defaultValue={defaultValue?.value}
                    maxLength={2000}
                    autoSize={{
                        minRows: 7,
                    }}
                    placeholder={t("inner.text")}
                />
                <Upload 
                    {...upload} 
                    defaultFileList={defaultFileList}
                    maxCount={1}
                    onRemove={(file) => {
                        annex.splice(annex.findIndex(e => e.name === file.name), 1);
                        setAnnex([...annex]);
                        onChangeValue();
                    }}>
                    <Button 
                        icon={<UploadOutlined />}
                        style={{
                            marginTop: "30px"
                        }}
                    >{t("btn.upload")}</Button>
                </Upload>
                <Space 
                    size="middle" 
                    style={{
                        marginTop: "10px"
                    }}
                >
                    <p>{t("suport")}: .rar .zip .doc .jpg...</p>
                    <p>{t("size")}: 20MB</p>
                </Space>
            </div>
        </div>
    )
} 