import { useContractRead } from "wagmi"
import { useBadgeConfig, useQuestConfig } from "./config"
import { constans } from "@/utils/constans";


export function useBadgeContract({functionName, args}) {
  const { defaultChainId } = constans();

  const { config } = useBadgeConfig({
    functionName: functionName,
    args: args
  })
  const { data, isLoading, refetch, error } = useContractRead({
    ...config,
    chainId: defaultChainId
  })

  return {
    data,
    isLoading,
    refetch
  }
}

export function useQuestContract({functionName, args}) {
  const { defaultChainId } = constans();
  
  const { config } = useQuestConfig({
    functionName: functionName,
    args: args
  })
  const { data, isLoading, refetch } = useContractRead({
    ...config,
    chainId: defaultChainId
  })

  return {
    data,
    isLoading,
    refetch
  }
}