import type { ExchangeProxy } from '@dimensiondev/contracts/types/ExchangeProxy'
import { useConstant } from '../../../../web3/hooks/useConstant'
import ExchangeProxyABI from '@dimensiondev/contracts/abis/ExchangeProxy.json'
import { TRADE_CONSTANTS } from '../../constants'
import { useContract } from '../../../../web3/hooks/useContract'
import type { Contract } from '@ethersproject/contracts'

export function useExchangeProxyContract() {
    const address = useConstant(TRADE_CONSTANTS, 'BALANCER_EXCHANGE_PROXY_ADDRESS')
    return (useContract<Contract>(address, ExchangeProxyABI) as unknown) as ExchangeProxy
}
