import { useCallback } from 'react'
import { EthereumAddress } from 'wallet.ts'
import BigNumber from 'bignumber.js'
import { useAccount } from './useAccount'
import { useERC20TokenContract } from '../contracts/useERC20TokenContract'
import { TransactionStateType, useTransactionState } from './useTransactionState'
import Services from '../../extension/service'
import { StageType } from '../types'

export function useERC20TokenTransferCallback(address: string, amount?: string, recipient?: string) {
    const account = useAccount()
    const erc20Contract = useERC20TokenContract(address)
    const [transferState, setTransferState] = useTransactionState()

    const transferCallback = useCallback(async () => {
        if (!account || !recipient || !amount || new BigNumber(amount).isZero() || !erc20Contract) {
            setTransferState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // error: invalid recipient address
        if (!EthereumAddress.isValid(recipient)) {
            setTransferState({
                type: TransactionStateType.FAILED,
                error: new Error('Invalid recipient address'),
            })
            return
        }

        // error: insufficent balance
        const balance = await erc20Contract.balanceOf(account)

        if (new BigNumber(amount).isGreaterThan(new BigNumber(balance))) {
            setTransferState({
                type: TransactionStateType.FAILED,
                error: new Error('Insufficent balance'),
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setTransferState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // step 1: estimate gas
        const estimatedGas = await erc20Contract.estimateGas.transfer(recipient, amount)

        // step 2: blocking
        return new Promise<void>(async (resolve, reject) => {
            const transaction = await erc20Contract.transfer(recipient, amount, {
                gasLimit: estimatedGas,
            })

            for await (const stage of Services.Ethereum.watchTransaction(account, transaction)) {
                switch (stage.type) {
                    case StageType.RECEIPT:
                        setTransferState({
                            type: TransactionStateType.CONFIRMED,
                            no: 0,
                            receipt: stage.receipt,
                        })
                        break
                    case StageType.CONFIRMATION:
                        setTransferState({
                            type: TransactionStateType.CONFIRMED,
                            no: stage.no,
                            receipt: stage.receipt,
                        })
                        resolve()
                        break
                    case StageType.ERROR:
                        setTransferState({
                            type: TransactionStateType.FAILED,
                            error: stage.error,
                        })
                        reject(stage.error)
                        break
                }
            }
        })
    }, [account, address, amount, recipient, erc20Contract])

    const resetCallback = useCallback(() => {
        setTransferState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [transferState, transferCallback, resetCallback] as const
}
