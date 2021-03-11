import type { Airdrop } from '@dimensiondev/contracts/types/Airdrop'
import { useConstant } from '../../../web3/hooks/useConstant'
import { useContract } from '../../../web3/hooks/useContract'
import { AIRDROP_CONSTANTS } from '../constants'
import AirdropABI from '@dimensiondev/contracts/abis/Airdrop.json'
import type { Contract } from '@ethersproject/contracts'

export function useAirdropContract() {
    const address = useConstant(AIRDROP_CONSTANTS, 'AIRDROP_CONTRACT_ADDRESS')
    return (useContract<Contract>(address, AirdropABI) as unknown) as Airdrop
}
