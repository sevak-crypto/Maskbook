import RouterV2ABI from '@dimensiondev/contracts/abis/RouterV2.json'
import { useContract } from '../../../../web3/hooks/useContract'
import { useConstant } from '../../../../web3/hooks/useConstant'
import { TRADE_CONSTANTS } from '../../constants'
import type { RouterV2 } from '@dimensiondev/contracts/types/RouterV2'
import type { Contract } from '@ethersproject/contracts'

export function useRouterV2Contract() {
    const address = useConstant(TRADE_CONSTANTS, 'UNISWAP_V2_ROUTER_ADDRESS')
    return (useContract<Contract>(address, RouterV2ABI) as unknown) as RouterV2
}
