import { useTranslation } from "react-i18next";
import { Button, Input, Space, Upload, message } from "antd";
import { UploadOutlined } from '@ant-design/icons';
import CustomViewer from "../CustomViewer";
import { uploadFile } from "@/request/api/public";
import { useEffect, useState } from "react";
import { changeConnect } from "@/utils/redux";
import { useAddress } from "@/hooks/useAddress";

const { TextArea } = Input;

export default function CustomOpen(props) {
    
    const { label, value, defaultValue, defaultFileList } = props;
    const { t } = useTranslation(["explore"]);
    const { isConnected } = useAddress();
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
                    annex.push({
                        name: file.name,
                        hash: "https://ipfs.decert.me/" + res.data.hash
                    })
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
                changeConnect()
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
            <div className="inner-title">
                <CustomViewer label={label} />
            </div>
            <div className="CustomInput-content">
                <TextArea 
                    className={`custom-input`} 
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