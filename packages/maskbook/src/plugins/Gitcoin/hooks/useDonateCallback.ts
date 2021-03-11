import { useCallback, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { ERC20TokenDetailed, EthereumTokenType, EtherTokenDetailed } from '../../../web3/types'
import { useConstant } from '../../../web3/hooks/useConstant'
import { GITCOIN_CONSTANT } from '../constants'
import { TransactionStateType, useTransactionState } from '../../../web3/hooks/useTransactionState'
import { useBulkCheckoutContract } from '../contracts/useBulkCheckoutWallet'
import { useAccount } from '../../../web3/hooks/useAccount'
import type { TransactionRequest } from '@ethersproject/providers'
import Services from '../../../extension/service'
import { StageType } from '../../../extension/background-script/EthereumService'

/**
 * A callback for donate gitcoin grant
 * @param address the donor address
 * @param amount
 * @param token
 */
export function useDonateCallback(address: string, amount: string, token?: EtherTokenDetailed | ERC20TokenDetailed) {
    const GITCOIN_ETH_ADDRESS = useConstant(GITCOIN_CONSTANT, 'GITCOIN_ETH_ADDRESS')
    const GITCOIN_TIP_PERCENTAGE = useConstant(GITCOIN_CONSTANT, 'GITCOIN_TIP_PERCENTAGE')
    const bulkCheckoutContract = useBulkCheckoutContract()

    const account = useAccount()
    const [donateState, setDonateState] = useTransactionState()

    const donations = useMemo(() => {
        const tipAmount = new BigNumber(GITCOIN_TIP_PERCENTAGE / 100).multipliedBy(amount)
        const grantAmount = new BigNumber(amount).minus(tipAmount)
        if (!address || !token) return []
        return [
            {
                token: token.type === EthereumTokenType.Ether ? GITCOIN_ETH_ADDRESS : token.address,
                amount: tipAmount.toFixed(),
                dest: address,
            },
            {
                token: token.type === EthereumTokenType.Ether ? GITCOIN_ETH_ADDRESS : token.address,
                amount: grantAmount.toFixed(),
                dest: address,
            },
        ]
    }, [address, amount, token])

    const donateCallback = useCallback(async () => {
        if (!token || !bulkCheckoutContract || donations.length === 0) {
            setDonateState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setDonateState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // step 1: estimate gas
        const config: TransactionRequest = {
            from: account,
            to: bulkCheckoutContract.options.address,
            value: new BigNumber(token.type === EthereumTokenType.Ether ? amount : 0).toFixed(),
        }
        const estimatedGas = await bulkCheckoutContract.estimateGas.donate(donations).catch((error) => {
            setDonateState({
                type: TransactionStateType.FAILED,
                error,
            })
            throw error
        })

        // step 2: blocking
        return new Promise<string>(async (resolve, reject) => {
            const transaction = await bulkCheckoutContract.donate(donations, {
                gasLimit: estimatedGas,
            })

            for await (const stage of Services.Ethereum.watchTransaction(account, transaction)) {
                switch (stage.type) {
                    case StageType.TRANSACTION_HASH:
                        setDonateState({
                            type: TransactionStateType.HASH,
                            hash: stage.hash,
                        })
                        resolve(stage.hash)
                        break
                    case StageType.ERROR:
                        setDonateState({
                            type: TransactionStateType.FAILED,
                            error: stage.error,
                        })
                        reject(stage.error)
                        break
                }
            }
        })
    }, [address, account, amount, token, donations])

    const resetCallback = useCallback(() => {
        setDonateState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [donateState, donateCallback, resetCallback] as const
}
