import store from "@/redux/store";
import { useState } from "react";
import MyContext from "./context";
import { getContract } from '@wagmi/core'
import { BadgeAbi, BadgeAddr, BadgeMinterAbi, BadgeMinterAddr, QuestMinterAbi, QuestMinterAddr } from "@/contracts";

export default function MyProvider(props) {
    const { web3Modal } = props;
    let [isMobile, setIsMobile] = useState();
    let [user, setUser] = useState();
    
    const questMinterContract = getContract({
      address: QuestMinterAddr,
      abi: QuestMinterAbi,
    })

    const badgeContract = getContract({
      address: BadgeAddr,
      abi: BadgeAbi,
    })

    const badgeMinterContract = getContract({
      address: BadgeMinterAddr,
      abi: BadgeMinterAbi,
    })

    function handleMobileChange() {
        isMobile = store.getState().isMobile;
        setIsMobile(isMobile);
    }

    function handleUser(params) {
        user = store.getState().user;
        setUser(user);
    }

    store.subscribe(handleMobileChange);

    store.subscribe(handleUser);

    return (
        <MyContext.Provider value={{ isMobile, user, questMinterContract, badgeContract, badgeMinterContract, web3Modal }}>
          {props.children}
        </MyContext.Provider>
      );
}