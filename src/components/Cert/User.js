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
import { createFromIconfontCN } from '@ant-design/icons';
import { useUpdateEffect } from "ahooks";
const IconFont = createFromIconfontCN({
  scriptUrl: [
    "//at.alicdn.com/t/c/font_4015269_oaebbfmee5.js"
  ],
});

export default function CertUser(props) {

    const { ensParse, urlAddr } = props;
    const location = useLocation();
    const { t } = useTranslation(["translation","profile", "explore"]);
    let [socials, setSocials] = useState();
    let [info, setInfo] = useState();


    const share = () => {
      let text = window.location.origin + location.pathname + location.search + location.hash;
      Copy(text, t("message.success.copy-link"))
    }

    const init = async() => {
      let user;
      if (ensParse.address) {
        user = await getUser({address: ensParse.address});
      }
      if (user?.data) {
        socials = user.data.socials;
        setSocials({...socials});
      }
      let ensAvatar;
      // 头像为ens ==> 解析
      if (ensParse?.avatar.indexOf("ipfs://") !== -1) {
        ensAvatar = ensParse.avatar.replace("ipfs://", process.env.REACT_APP_IPFS_PARSE)
      }
      setTimeout(() => {
        info = {
            nickname: user?.data?.nickname ? user?.data?.nickname : ensParse.domain ? ensParse.domain : urlAddr ? urlAddr : NickName(ensParse.address),
            address: ensParse.address,
            avatar: user?.data?.avatar ? process.env.REACT_APP_BASE_URL + user?.data?.avatar : ensAvatar ? ensAvatar : ensParse.avatar ? ensParse.avatar : hashAvatar(ensParse.address)
        }
          setInfo({...info})
      }, 1000);
    }

    useUpdateEffect(() => {
      init()
    },[ensParse])

  return (
    <div className="user">
      {info ? (
        <>
         <div className="avatar">
            <div className="img">
              <img src={info.avatar} alt="" />
            </div>
          </div>
          <div className="user-info">
            <p className="name">
              {info.nickname ? info.nickname : NickName(info.address)}
            </p>
            <p
              className="address"
              onClick={() =>
                Copy(ensParse.address, t("message.success.copy-addr"))
              }
            >
              {NickName(ensParse.address)}
              <CopyOutlined style={{ color: "#3C6EB9", marginLeft: "12px" }} />
            </p>
            
            <Button className="share" onClick={share} disabled={!ensParse.address}>
              <IconFont type="icon-share" />
            </Button>

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
