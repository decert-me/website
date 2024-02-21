import { Tooltip } from "antd";


export default function ThirdpartyUserInfo({info}) {
    
    function replaceAt(str, index, replacement) {
        if (index >= str.length) {
          return str.valueOf();
        }
        return str.substring(0, index) + replacement + str.substring(index + 1);
    }

    if (info?.thirdparty_user_info) {
        const img = require(`@/assets/images/icon/social-${info.thirdparty_user_info.provider}.svg`);
        const provider = info.thirdparty_user_info.user_info;
        return (
            <Tooltip title={provider.email || provider.name}>
                <img 
                    src={img} 
                    style={{
                        width: "20px",
                        margin: "-4px 10px 0"
                    }}
                    alt="social" 
                />
            </Tooltip>
        )
    }else{
        if (info?.email) {
            return (
                <Tooltip title={info.email}>
                    <img 
                        src={require(`@/assets/images/icon/social-email.png`)} 
                        style={{
                            width: "20px",
                            margin: "-4px 10px 0"
                        }}
                        alt="social" 
                    />
                </Tooltip>
            )
        }
        if (info?.phone) {
            let str = info.phone;
            for (let i = str.length - 5; i >= str.length - 8; i--) {
                str = replaceAt(str, i, '.');
            }
            return (
                <Tooltip title={str}>
                    <img 
                        src={require(`@/assets/images/icon/social-phone.png`)} 
                        style={{
                            width: "20px",
                            margin: "-4px 10px 0"
                        }}
                        alt="social" 
                    />
                </Tooltip>
            )   
        }
    }
}