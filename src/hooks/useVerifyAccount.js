import { useState } from "react";
import { useEnsAddress } from "wagmi";
import { message } from "antd";


export const useVerifyAccount = (props) => {

    const { address, timeout } = props;
    let [isLoading, setIsLoading] = useState();

    const { data: account, isSuccess: ensSuccess, refetch: getEns, status } = useEnsAddress({
        name: address,
        chainId: 1,
        enabled: false
    })

    const verify = async() => {
        setIsLoading(true);
        return await new Promise((resolve, reject) => {
            getEns()
            .then(res => {
                if (res.data) {
                    resolve(res.data)
                    setIsLoading(false);
                }else{
                    message.error("请输入正确的地址");
                    setIsLoading(false);
                }
            })
        })
        .then(res => {
            return res
        })
    }

    return {
        verify,
        account,
        isLoading
    }
}