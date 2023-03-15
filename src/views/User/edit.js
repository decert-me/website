import "@/assets/styles/view-style/user-edit.scss"
import { Button, Input, message, Upload } from "antd"
import {
    PlusOutlined,
    LoadingOutlined,
    // PlusOutlined

} from '@ant-design/icons';
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useLocation, useNavigate } from "react-router-dom";
import { hashAvatar } from "@/utils/HashAvatar";
import { NickName } from "@/utils/NickName";
import { getUser, putUser } from "@/request/api/public";
import { UploadAvatarProps } from "@/utils/UploadProps";
const { TextArea } = Input;

export default function UserEdit(params) {
    
    /**
     * TODO: ===>
     * 1. 校验是否是本人 ==> 否 ===> 跳转至该地址详情页
     * 2. 获取个人资料
     * 3. 回显
     * 4. 提交
     */
    const { address } = useAccount();
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
        navigateTo(`/user/${account}`);
    }

    const changeUser = (value, key) => {
        user[key] = value;
        setUser({...user});
    }

    const save = () => {
        putUser(user)
        .then(res => {
            if (res) {
                message.success('保存成功!');
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
            description: user?.description ? user.description : "暂无介绍",
            avatar: user?.avatar ? process.env.REACT_APP_DEVELOP_BASE_URL + user.avatar : hashAvatar(account)
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
                    编辑资料
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
                            onChange={handleChange}
                        >
                            <Button className="btn">
                                
                                {
                                    loading ? 
                                    <>
                                        <LoadingOutlined />正在上传
                                    </>
                                    :
                                    <>
                                        <PlusOutlined />上传头像
                                    </>
                                }
                            </Button>
                        </Upload>
                    </div>
                    <div className="inner">
                        <p className="label">名称</p>
                        <Input 
                            className="input" 
                            placeholder="0x0a...9e57" 
                            maxLength={16} 
                            defaultValue={info.nickname}
                            onChange={(e) => changeUser(e.target.value, 'nickname')}
                        />
                    </div>
                    <div className="inner">
                        <p className="label">简介</p>
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
                            placeholder="请介绍你的兴趣或经验..."
                        />
                    </div>
                </div>
            </div>
            <div className="UserEdit-btns">
                <Button 
                    danger 
                    className="btn cancel"
                    onClick={goBack}
                >
                    取消
                </Button>
                <Button 
                    type="primary" 
                    className="btn save"
                    onClick={() => save()}
                >
                    保存
                </Button>
            </div>
        </div>
    )
}