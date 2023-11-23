import store from "@/redux/store";
import { useState } from "react";
import MyContext from "./context";
import { getContract } from '@wagmi/core'
import { BadgeAbi, BadgeAddr, QuestMinterAbi, QuestMinterAddr } from "@/contracts";

export default function MyProvider(props) {
    let [isMobile, setIsMobile] = useState();
    let [user, setUser] = useState();

    const questContract = getContract({
      address: QuestMinterAddr,
      abi: QuestMinterAbi,
    })

    const badgeContract = getContract({
      address: BadgeAddr,
      abi: BadgeAbi,
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
        <MyContext.Provider value={{ isMobile, user, questContract, badgeContract }}>
          {props.children}
        </MyContext.Provider>
      );
}