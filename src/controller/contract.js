import { useContractRead } from "wagmi"
import { useBadgeConfig, useQuestConfig } from "./config"


export function useBadgeContract({functionName, args}) {

  const { config } = useBadgeConfig({
    functionName: functionName,
    args: args
  })
  const { data, isLoading, refetch, error } = useContractRead({
    ...config,
    chainId: Number(process.env.REACT_APP_CHAIN_ID)
  })

  return {
    data,
    isLoading,
    refetch
  }
}

export function useQuestContract({functionName, args}) {
  
  const { config } = useQuestConfig({
    functionName: functionName,
    args: args
  })
  const { data, isLoading, refetch } = useContractRead({
    ...config,
    chainId: Number(process.env.REACT_APP_CHAIN_ID)
  })

  return {
    data,
    isLoading,
    refetch
  }
}