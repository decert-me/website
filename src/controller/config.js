import { usePrepareContractWrite } from "wagmi";
import badgeAddr from "@/contracts/Badge.address";
import badge from "@/contracts/Badge.abi";
import questMinterAddr from "@/contracts/QuestMinter.address";
import questMinter from "@/contracts/QuestMinter.abi";

export function useBadgeConfig({functionName, args}) {
    const { config, error } = usePrepareContractWrite({
        address: badgeAddr,
        abi: badge,
        functionName: functionName,
        args: args,
        chainId: Number(process.env.REACT_APP_CHAIN_ID),
        onError() {
            console.log(error);
        }
    })
    return {
        config
    }
}

export function useQuestConfig({functionName, args}) {
    const { config, error } = usePrepareContractWrite({
        address: questMinterAddr,
        abi: questMinter,
        functionName: functionName,
        args: args,
        chainId: Number(process.env.REACT_APP_CHAIN_ID),
        onError() {
            console.log(error);
        }
    })
    return {
        config
    }
}