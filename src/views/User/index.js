import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAccount } from "wagmi";



export default function User(props) {
    
    const location = useLocation();
    const { address } = useAccount();
    let [account, setAccount] = useState();
    let [isMe, setIsMe] = useState();

    useEffect(() => {
        account = location?.pathname?.split("/")[1];
        setAccount(account);
        setIsMe(address === account);
    }, []);

    return (
        <div className="User">
            <div className="User-info">
                 
            </div>
            <div className="User-list">

            </div>
            <div className="User-content">

            </div>
        </div>
    )
}