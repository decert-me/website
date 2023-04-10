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
import { useLocation } from "react-router-dom";



export default function CertUser(props) {

    const { account, ensName, status } = props;
    const location = useLocation();
    const { t } = useTranslation(["translation","profile", "explore"]);
    let [socials, setSocials] = useState();
    let [info, setInfo] = useState();


    const share = () => {
      let text = window.location.origin + location.pathname + location.search + location.hash;
      Copy(text, '成功')
    }

    const init = async() => {
      if (!account) {
        return
      }
      const user = await getUser({address: account});
      if (user.status !== 0) {
          return
      }
      if (user.data) {
        socials = user.data.socials;
        setSocials({...socials});
      }
      info = {
          nickname: user?.data?.nickname ? user?.data?.nickname : ensName ? ensName : NickName(account),
          address: account,
          avatar: user?.data?.avatar ? process.env.REACT_APP_DEVELOP_BASE_URL + user?.data?.avatar : hashAvatar(account)
      }
      setTimeout(() => {
          setInfo({...info})
      }, 1000);
    }

    useEffect(() => {
      console.log(account, ensName);
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
            <Button className="share" onClick={share} disabled={status=="error"}>分享</Button>
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
