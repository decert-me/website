import { Button } from "antd";
import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { verifyDiscord } from "@/request/api/public"
import { Link } from "react-router-dom";
import { useRequest } from "ahooks";



export default function CustomDiscord(props) {

    
    const { step, setStep } = props;
    const { address } = useAccount();
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
        }
    }

    const { run } = useRequest(verify, {
        debounceWait: 500,
        manual: true
    });

    
    useEffect(() => {
        if (isBind && step === 2) {
            setStep(3)
        }
    },[isBind])

    useEffect(() => {
        verify();
        console.log('开启discord验证 ==>');
    },[step])

    const decertToken = (e) => {
        if (e.key === "decert.token") {
            run()
        }
    }

    useEffect(() => {
        var orignalSetItem = localStorage.setItem;
        localStorage.setItem = function(key,newValue){
            var setItemEvent = new Event("setItemEvent");
            setItemEvent.key = key;
            setItemEvent.newValue = newValue;
            setItemEvent.oldValue = localStorage.getItem(key);
            window.dispatchEvent(setItemEvent);
            orignalSetItem.apply(this,arguments);
        }
        window.addEventListener('setItemEvent', decertToken)
        return () => {
            window.removeEventListener('setItemEvent', decertToken)
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