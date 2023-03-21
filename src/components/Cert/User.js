import { getUser } from "@/request/api/public";
import { Copy } from "@/utils/Copy";
import { hashAvatar } from "@/utils/HashAvatar";
import { NickName } from "@/utils/NickName";
import {
    CopyOutlined
} from '@ant-design/icons';
import { Button, Skeleton } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";



export default function CertUser(props) {

    const { account } = props;
    const { t } = useTranslation(["translation","profile", "explore"]);
    let [socials, setSocials] = useState();
    let [info, setInfo] = useState();

    const init = async() => {
        const user = await getUser({address: account});
        if (!user.data) {
            return
        }
        socials = user.data.socials;
        setSocials({...socials});
        info = {
            nickname: user.data.nickname ? user.data.nickname : NickName(account),
            address: account,
            avatar: user.data.avatar ? process.env.REACT_APP_DEVELOP_BASE_URL + user.data.avatar : hashAvatar(account)
        }
        setTimeout(() => {
            setInfo({...info})
        }, 1000);
    }

    useEffect(() => {
        init()
    },[account])

  return (
    <div className="user">
      {info ? (
        <>
          <div className="avatar">
            <div className="img">
              <img src={hashAvatar(account)} alt="" />
            </div>
          </div>
          <div className="user-info">
            <p className="name">
              {info.nickname ? info.nickname : NickName(info.address)}
            </p>
            <p
              className="address"
              onClick={() =>
                Copy(account, t("translation:message.success.copy"))
              }
            >
              {NickName(account)}
              <CopyOutlined style={{ color: "#3C6EB9", marginLeft: "12px" }} />
            </p>
            <Button className="share">分享</Button>
          </div>
        </>
      ) : (
        <Skeleton
          active
          avatar
          paragraph={{
            rows: 1,
          }}
        />
      )}
    </div>
  );
}
