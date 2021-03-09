import { useAsync } from 'react-use'
import { PluginTraderRPC } from '../messages'
import { useEffect } from 'react'

export function useCoinLatestPrice(coinId: string | undefined) {
    useEffect(() => {
        PluginTraderRPC.getLatestPrice(coinId)

        return () => {
            PluginTraderRPC.unSubscribe()
        }
    }, [coinId])
}
