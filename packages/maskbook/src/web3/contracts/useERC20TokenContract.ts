import type { ERC20 } from '@dimensiondev/contracts/types/ERC20'
import ERC20ABI from '@dimensiondev/contracts/abis/ERC20.json'
import { useContract } from '../hooks/useContract'
import type { Contract } from '@ethersproject/contracts'

export function useERC20TokenContract(address: string) {
    return (useContract<Contract>(address, ERC20ABI) as unknown) as ERC20
}
