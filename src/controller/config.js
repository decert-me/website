import { usePrepareContractWrite } from "wagmi";
import badgeAddr from "@/contracts/Badge.address";
import badge from "@/contracts/Badge.abi";
import questMinterAddr from "@/contracts/QuestMinter.address";
import questMinter from "@/contracts/QuestMinter.abi";
import { constans } from "@/utils/constans";

export function useBadgeConfig({functionName, args}) {
    const { defaultChainId } = constans();
    const { config, error } = usePrepareContractWrite({
        address: badgeAddr,
        abi: badge,
        functionName: functionName,
        args: args,
        chainId: defaultChainId,
        onError() {
            console.log(error);
        }
    })
    return {
        config
    }
}

export function useQuestConfig({functionName, args}) {
    const { defaultChainId } = constans();
    const { config, error } = usePrepareContractWrite({
        address: questMinterAddr,
        abi: questMinter,
        functionName: functionName,
        args: args,
        chainId: defaultChainId,
        onError() {
            console.log(error);
        }
    })
    return {
        config
    }
}