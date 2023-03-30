import { useEffect, useState } from "react";
import { useEnsAddress } from "wagmi";
import { message } from "antd";


export const useVerifyAccount = (props) => {

    const { address, timeout } = props;
    let [isLoading, setIsLoading] = useState();

    const { data: account, isSuccess: ensSuccess, refetch: getEns, status } = useEnsAddress({
        name: address,
        enabled: false
    })

    const verify = async() => {
        setIsLoading(true);
        await getEns();
    }

    useEffect(() => {
        setTimeout(() => {
            if (status === "error") {
                message.error("请输入正确的地址");
                setIsLoading(false);
            }
            if ("success") {
                setIsLoading(false);
            }
        }, timeout ? timeout : 1000);
    },[status])

    return {
        verify,
        account,
        isLoading
    }
}