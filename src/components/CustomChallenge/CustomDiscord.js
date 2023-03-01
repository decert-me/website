import { Button } from "antd";
import { useEffect, useState } from "react"
import { useAccount, useSigner } from "wagmi"
import { verifyDiscord } from "@/request/api/public"
import { GetSign } from "@/utils/GetSign";
import { Link } from "react-router-dom";



export default function CustomDiscord(props) {
    /**
     * 1. 初始化核实discord
     * 2. 
     *   */
    
    const { step, setStep } = props;
    const { address, isConnected } = useAccount();
    const { data: signer } = useSigner();
    let [isBind, setIsBind] = useState();
    
    const verify = () => {
        const token = localStorage.getItem('decert.token')
        if (token) {
            verifyDiscord({address: address})
            .then(res => {
                console.log('====>',res);
                isBind = res.status !== 0 ? false : res.data ? true : false;
                setIsBind(isBind);
                console.log('isBind ==>',isBind);
            })
            console.log('核实 ===>');
        }else if (isConnected === true) {
            GetSign({address: address, signer: signer})
            console.log('签名 ===>');
        }
    }
    
    useEffect(() => {
        if (isBind && step === 2) {
            setStep(3)
        }
    },[isBind])

    useEffect(() => {
        verify();
    },[step])

    return (
        <div className={`CustomBox step-box ${step === 2 ? "checked-step" : ""}`}>
            {
                isBind ? 
                <>
                    <p>绑定成功</p>
                    <p>Discord已验证成功</p>
                </>
                :
                <>
                    <p>未验证信息Discord</p>
                    {
                        step >= 2 &&
                        <div>
                            <Button onClick={verify}>核实</Button>
                            <Link to="https://discord.com/invite/WR3uxWad7B" target="_blank">
                                <Button>打开Discord</Button>
                            </Link>
                        </div>
                    }
                </>
            }
        </div>
    )
}