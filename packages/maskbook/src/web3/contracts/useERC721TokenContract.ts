import type { Contract } from '@ethersproject/contracts'
import type { ERC721 } from '@dimensiondev/contracts/types/ERC721'
import ERC721ABI from '@dimensiondev/contracts/abis/ERC721.json'
import { useContract } from '../hooks/useContract'

export function useERC721TokenContract(address: string) {
    return (useContract<Contract>(address, ERC721ABI) as unknown) as ERC721
}
