import { useAccount } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect } from "react";



export const useAddress = () => {
    const { address: wagmiAddress, isConnected: wagmiConnected } = useAccount()
    const { publicKey, connected } = useWallet();

    let [address, setAddress] = useState();
    let [walletType, setWalletType] = useState();
    let [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (wagmiAddress || publicKey) {
            address = wagmiAddress || publicKey.toString();
            setAddress(address);
            walletType = /^0x/.test(address) ? "evm" : "solana";
            setWalletType(walletType);
        }else{
            setAddress(null);
            setWalletType(null);
        }
    },[wagmiAddress, publicKey])

    useEffect(() => {
        isConnected = wagmiConnected || connected;
        setIsConnected(isConnected);
    },[wagmiConnected, connected])

    return {
        address,
        walletType,
        isConnected
    }
}