import { useConstant } from '../../../web3/hooks/useConstant'
import { GITCOIN_CONSTANT } from '../constants'
import { useContract } from '../../../web3/hooks/useContract'
import BulkCheckoutABI from '@dimensiondev/contracts/abis/BulkCheckout.json'
import type { BulkCheckout } from '@dimensiondev/contracts/types/BulkCheckout'
import type { Contract } from '@ethersproject/contracts'

export function useBulkCheckoutContract() {
    const address = useConstant(GITCOIN_CONSTANT, 'BULK_CHECKOUT_ADDRESS')
    return (useContract<Contract>(address, BulkCheckoutABI) as unknown) as BulkCheckout
}
