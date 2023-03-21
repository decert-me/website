import { useState } from "react";
import { useEnsAddress, usePrepareSendTransaction } from "wagmi";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { message } from "antd";


export const useVerifyAccount = (props) => {

    const { address, timeout } = props;
    const navigateTo = useNavigate();
    let [isPass, setIsPass] = useState(false);
    let [isLoading, setIsLoading] = useState();

    const { isSuccess: addrSuccess, refetch: getAddr } = usePrepareSendTransaction({
        request: {
          to: address,
          value: ethers.utils.parseEther('0'),
        },
        enabled: false
    })

    const { data: account, isSuccess: ensSuccess, refetch: getEns } = useEnsAddress({
        name: address,
        enabled: false
    })

    const verify = async() => {
        setIsLoading(true);
        await getAddr();
        await getEns();
        setTimeout(() => {
            if (addrSuccess || ensSuccess) {
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