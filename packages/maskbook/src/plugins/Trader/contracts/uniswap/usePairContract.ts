import type { Contract } from '@ethersproject/contracts'
import type { Pair } from '@dimensiondev/contracts/types/Pair'
import PairABI from '@dimensiondev/contracts/abis/Pair.json'
import { useContract, useContracts } from '../../../../web3/hooks/useContract'

export function usePairContract(address: string) {
    return (useContract<Contract>(address, PairABI) as unknown) as Pair
}

export function usePairContracts(listOfAddress: string[]) {
    return (useContracts<Contract>(listOfAddress, PairABI) as unknown) as Pair[]
}
