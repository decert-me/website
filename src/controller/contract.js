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

  // async function reload(params) {
  //   await new Promise((resolve, reject) => {
  //     var timer = setInterval(async function() {
  //       await refetch()
  //       .then(res => {
  //         if (res.data !== undefined) {
  //           clearInterval(timer);
  //           resolve(res.data)
  //         }
  //       })
  //     }, 1000);
  //   })
  //   console.log(cache);
  // }

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