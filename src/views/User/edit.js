import "@/assets/styles/view-style/user-edit.scss"
import "@/assets/styles/mobile/view-style/user-edit.scss"
import { Button, Input, message, Upload } from "antd"
import {
    PlusOutlined,
    LoadingOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useLocation, useNavigate } from "react-router-dom";
import { hashAvatar } from "@/utils/HashAvatar";
import { NickName } from "@/utils/NickName";
import { getUser, putUser } from "@/request/api/public";
import { UploadAvatarProps } from "@/utils/UploadProps";
import { useTranslation } from "react-i18next";
import { changeConnect } from "@/utils/redux";
import { constans } from "@/utils/constans";
const { TextArea } = Input;

export default function UserEdit(params) {
    
    /**
     * 1. 校验是否是本人 ==> 否 ===> 跳转至该地址详情页
     * 2. 获取个人资料
     * 3. 回显
     * 4. 提交
     */
    const { address, isConnected } = useAccount();
    const { imgPath } = constans();
    const { t } = useTranslation(["translation","profile"]);
    const location = useLocation();
    const navigateTo = useNavigate();

    let [account, setAccount] = useState();
    let [user, setUser] = useState();
    let [info, setInfo] = useState();
    let [loading, setLoading] = useState(false);

    const getBase64 = (img, callback) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
    };

    const handleChange = (info) => {
        if (info.file.status === 'uploading') {
          setLoading(true);
          return;
        }
        if (info.file.status === 'done') {
          // Get this url from response in real world.
          getBase64(info.file.originFileObj, (url) => {
            setLoading(false);
            // setImageUrl(url);
            user.avatar = info.file.response.data.url;
            setUser({...user});
            info.avatar = url;
            setInfo({...info});
          });
        }
    };

    const goBack = () => {
        navigateTo(-1);
    }

    const changeUser = (value, key) => {
        user[key] = value;
        setUser({...user});
    }

    const save = () => {
        putUser(user)
        .then(res => {
            if (res) {
                message.success(t("translation:message.success.save"));
                setTimeout(() => {
                    goBack();
                }, 1000);
            }
        })
    }

    const verify = async() => {
        return new Promise((resolve, reject) => {
            account = location?.pathname?.split("/").slice(-1)[0];
            setAccount(account);
            let isMe = account === address;
            resolve(isMe)
        })
    }

    const init = async() => {
        if (!await verify()) {
            goBack();
            return
        }
        await getUser({address: account})
        .then(res => {
            user = res.data ? res.data : {};
            setUser({...user});
        })
        console.log(user);
        info = {
            nickname: user?.nickname ? user.nickname : NickName(account),
            address: account,
            description: user?.description ? user.description : "",
            avatar: user?.avatar ? imgPath + user.avatar : hashAvatar(account)
        }
        setInfo({...info});
        console.log(info);
    }

    useEffect(() => {
        init();
    },[])

    return (
        info &&
        <div className="UserEdit">
            <div className="UserEdit-inner">
                <div className="title">
                    {t("profile:edit.title")}
                </div>
                <div className="content">
                    <div className="avatar">
                        <div className="img">
                            <img src={info.avatar} alt="" />
                        </div>
                        <Upload
                            name="avatar"
                            listType="picture-circle"
                            className="avatar-uploader"
                            showUploadList={false}
                            {...UploadAvatarProps} 
                            beforeUpload={(file) => {
                                if (!isConnected) {
                                    changeConnect()
                                    return false || Upload.LIST_IGNORE
                                }
                                UploadAvatarProps.beforeUpload(file)
                            }}
                            onChange={handleChange}
                        >
                            <Button className="btn">
                                
                                {
                                    loading ? 
                                    <>
                                        <LoadingOutlined style={{marginRight: "10px"}} />{t("profile:edit.uploading")}
                                    </>
                                    :
                                    <>
                                        <PlusOutlined style={{marginRight: "10px"}} />{t("profile:edit.upload")}
                                    </>
                                }
                            </Button>
                        </Upload>
                    </div>
                    <div className="inner">
                        <p className="label">{t("profile:edit.inner.name")}</p>
                        <Input 
                            className="input" 
                            placeholder={NickName(account)}
                            maxLength={16} 
                            defaultValue={info.nickname}
                            onChange={(e) => changeUser(e.target.value, 'nickname')}
                        />
                    </div>
                    <div className="inner">
                        <p className="label">{t("profile:edit.inner.desc")}</p>
                        <TextArea
                            showCount
                            maxLength={100}
                            className="textarea"
                            defaultValue={info.description}
                            onChange={(e) => changeUser(e.target.value, 'description')}
                            style={{
                                height: 120,
                                resize: 'none',
                            }}
                            // onChange={onChange}
                            placeholder={t("profile:edit.inner.tips.desc")}
                        />
                    </div>
                </div>
            </div>
            <div className="UserEdit-btns">
                <Button 
                    className="btn cancel"
                    onClick={goBack}
                >
                    {t("translation:btn-cancel")}
                </Button>
                <Button 
                    type="primary" 
                    className="btn save"
                    onClick={() => save()}
                >
                    {t("translation:btn-save")}
                </Button>
            </div>
        </div>
    )
}