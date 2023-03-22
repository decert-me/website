import { useState } from "react";
import { useEnsAddress } from "wagmi";
import { useNavigate } from "react-router-dom";
import { message } from "antd";


export const useVerifyAccount = (props) => {

    const { address, timeout } = props;
    const navigateTo = useNavigate();
    let [isPass, setIsPass] = useState(false);
    let [isLoading, setIsLoading] = useState();

    const { data: account, isSuccess: ensSuccess, refetch: getEns } = useEnsAddress({
        name: address,
        enabled: false
    })

    const verify = async() => {
        setIsLoading(true);
        await getEns();
        setTimeout(() => {
            if (ensSuccess) {
                isPass=true;
                setIsPass(isPass);
                navigateTo(`/${account}`)
            }else{
                message.error("请输入正确的地址");
            }
            setIsLoading(false);
        }, timeout ? timeout : 1000);
    }

    return {
        verify,
        account,
        isPass,
        isLoading
    }
}