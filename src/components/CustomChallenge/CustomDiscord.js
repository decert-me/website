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
    let [username, setUsername] = useState();
    
    const verify = () => {
        const token = localStorage.getItem('decert.token')
        if (token) {
            verifyDiscord({address: address})
            .then(res => {
                isBind = res.status !== 0 ? false : res.data ? true : false;
                setIsBind(isBind);
                username = res.data?.username ? res.data.username : null;
                setUsername(username);
            })
        }else if (isConnected === true) {
            GetSign({address: address, signer: signer})
        }
    }
    
    useEffect(() => {
        if (isBind && step === 2) {
            setStep(3)
        }
    },[isBind])

    useEffect(() => {
        verify();
        console.log('开启discord验证 ==>');
    },[step])

    useEffect(() => {
        function decertToken() {
            const item = localStorage.getItem('decert.token');
            console.log('item ===>',item);
            // if (item) {
                // setState(item);
            // }
        }
        window.addEventListener('storage', decertToken)
        return () => {
            window.removeEventListener('storage', decertToken)
        }
    }, [])

    return (
        <div className={`CustomBox step-box ${step === 2 ? "checked-step" : ""}`}>
            {
                isBind ? 
                <>
                    <p>{username}</p>
                    <p>已绑定Discord</p>
                </>
                :
                <>
                    <p>未绑定Discord</p>
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