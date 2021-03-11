import { CONSTANTS } from '../constants'
import { useConstant } from '../hooks/useConstant'
import { useContract } from '../hooks/useContract'
import BalanceCheckerABI from '@dimensiondev/contracts/abis/BalanceChecker.json'
import type { BalanceChecker } from '@dimensiondev/contracts/types/BalanceChecker'
import type { Contract } from '@ethersproject/contracts'

export function useBalanceCheckerContract() {
    const address = useConstant(CONSTANTS, 'BALANCE_CHECKER_ADDRESS')
    return (useContract<Contract>(address, BalanceCheckerABI) as unknown) as BalanceChecker
}
