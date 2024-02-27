import { Button, Input, message, Upload } from "antd"
import {
    PlusOutlined,
    LoadingOutlined,
} from '@ant-design/icons';
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { hashAvatar } from "@/utils/HashAvatar";
import { NickName } from "@/utils/NickName";
import { getUser, putUser } from "@/request/api/public";
import { UploadAvatarProps } from "@/utils/UploadProps";
import { useTranslation } from "react-i18next";
import { constans } from "@/utils/constans";
import { useAddress } from "@/hooks/useAddress";
import BindDiscordBtn from "./bindDiscordBtn";
import BindWechatBtn from "./bindWechatBtn";
import BindZkBtn from "./bindZkBtn";
import CustomIcon from "@/components/CustomIcon";
import MyContext from "@/provider/context";
import BindEmailBtn from "./bindEmailBtn";
import BindGithubBtn from "./bindGithubBtn";
const { TextArea } = Input;

export default function UserEdit(params) {
    
    /**
     * 1. 校验是否是本人 ==> 否 ===> 跳转至该地址详情页
     * 2. 获取个人资料
     * 3. 回显
     * 4. 提交
     */
    const { address, isConnected } = useAddress();
    const { imgPath } = constans();
    const { t } = useTranslation(["translation","profile"]);
    const { connectWallet } = useContext(MyContext);
    const location = useLocation();
    const navigateTo = useNavigate();
    
    const [highLine, setHighLine] = useState();
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

    const scrollToAnchor = (anchorName) => {
        try {            
            let anchorElement = document.getElementsByClassName(`edit-${anchorName}`)[0];
            anchorElement.scrollIntoView({behavior: "smooth", block: "center",});
            setHighLine(anchorName);
        } catch (error) {
            console.log(error);
        }
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
        info = {
            nickname: user?.nickname ? user.nickname : NickName(account),
            address: account,
            description: user?.description ? user.description : "",
            avatar: user?.avatar ? imgPath + user.avatar : hashAvatar(account)
        }
        setInfo({...info});
        if (location.search.indexOf("?") !== -1) {
            setTimeout(() => {
                scrollToAnchor(location.search.split("?")[1]);
            }, 20);
        }
    }

    useEffect(() => {
        address && init();
    },[address])

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
                                    connectWallet()
                                    return false || Upload.LIST_IGNORE
                                }
                                UploadAvatarProps.beforeUpload(file)
                            }}
                            onChange={handleChange}
                        >
                            <Button className="btn">
                                {
                                    loading ? t("profile:edit.uploading"):t("profile:edit.upload")
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
                            placeholder={t("profile:edit.inner.tips.desc")}
                        />
                    </div>
                    <div className="inner">
                        <p className="label">{t("profile:edit.inner.bindAc")}</p>
                        {/* 第三方绑定列表 */}
                        <div className="list">

                            <div className="item">
                                <div className="item-label">
                                    <img src={require("@/assets/images/icon/icon-github.png")} alt="" />
                                    <p>Github</p>
                                </div>
                                <BindGithubBtn />
                            </div>

                            <div className="item">
                                <div className="item-label">
                                    <img src={require("@/assets/images/icon/email.png")} alt="" />
                                    <p>Email</p>
                                </div>
                                <BindEmailBtn />
                            </div>

                            <div className="item">
                                <div className="item-label">
                                    <CustomIcon type="icon-discord" className="icon-discord" />
                                    <p>Discord</p>
                                </div>
                                <BindDiscordBtn />
                            </div>

                            <div className="item">
                                <div className="item-label">
                                    <CustomIcon type="icon-wechat" />
                                    <p>Wechat</p>
                                </div>
                                <BindWechatBtn />
                            </div>
 
                        </div>
                    </div>
                    <div className="inner">
                        <p className="label">{t("profile:edit.inner.recommend")}</p>
                        <div className="list">
                            <div className={`item edit-zk ${highLine === "zk" ? "highline" : ""}`}>
                                <BindZkBtn clear={() => setHighLine(null)} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="UserEdit-btns">
                    <Button 
                        type="primary" 
                        className="btn save"
                        onClick={() => save()}
                    >
                        {t("translation:btn-save")}
                    </Button>
                </div>
            </div>
        </div>
    )
}