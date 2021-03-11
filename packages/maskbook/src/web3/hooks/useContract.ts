import { useMemo } from 'react'
import { EthereumAddress } from 'wallet.ts'
import { ethers, Overrides } from 'ethers'
import type { Contract, ContractInterface } from '@ethersproject/contracts'
import { last, pickBy } from 'lodash-es'
import Services, { ServicesWithProgress } from '../../extension/service'
import { useAccount } from './useAccount'
import { nonFunctionalProvider, nonFunctionalSigner } from '../web3'
import { TransactionEventType } from '../types'
import type { FunctionFragment } from 'ethers/lib/utils'
import type { TransactionRequest } from '@ethersproject/providers'

function resolveParameters(...args: any[]) {
    const lastArg = last(args)
    const overrides = lastArg.nonce || lastArg.gasLimit || lastArg.gasPrice ? lastArg : undefined
    return [overrides ? args.slice(0, args.length - 1) : args, overrides]
}

function createContract<T extends Contract>(from: string, address: string, contractInterface: ContractInterface) {
    if (!address || !EthereumAddress.isValid(address)) return null

    // create a dummy contract instance
    const contract = (new ethers.Contract(address, contractInterface, nonFunctionalSigner) as unknown) as T

    // hijack meta-class methods on the dummy contract and redirect them to the background service
    return new Proxy(contract, {
        get(target, name) {
            const methodFragment = contract.interface.fragments.find((x) => x.type === 'function' && x.name === name)
            const eventFragments = contract.interface.events

            switch (name) {
                case 'estimateGas':
                    return async (...args: any[]) => {
                        if (!methodFragment) throw new Error(`Cannot find method ${name}.`)
                        try {
                            const [values, overrides] = resolveParameters(args)
                            return Services.Ethereum.estimateGas(
                                {
                                    from,
                                    to: contract.options.address,
                                    data: contract.interface.encodeFunctionData(
                                        methodFragment as FunctionFragment,
                                        values,
                                    ),
                                    ...overrides,
                                },
                                await Services.Ethereum.getChainId(from),
                            )
                        } catch (e) {
                            throw e
                        }
                    }
                case 'functions':
                    return null
                default:
                    // no a valid method invocation
                    if (!methodFragment) return Reflect.get(target, name)

                    return async (...args: any[]) => {
                        const [values, overrides] = resolveParameters(args)
                        const request: TransactionRequest = pickBy({
                            from,
                            to: contract.options.address,
                            data: contract.interface.encodeFunctionData(methodFragment as FunctionFragment, values),
                            ...overrides,
                        })

                        // constant fragment
                        if (methodFragment._isFragment) {
                            const result = await Services.Ethereum.callTransaction(request)
                            if (process.env.NODE_ENV === 'development')
                                console.log({
                                    type: 'call',
                                    name,
                                    args,
                                    request,
                                    result,
                                })
                            // return decodeOutputString(nonFunctionalProvider, methodABI?.outputs ?? [], result)
                            return '0x'
                        } else {
                            if (process.env.NODE_ENV === 'development')
                                console.log({
                                    type: 'send',
                                    name,
                                    args,
                                    request,
                                })

                            // for await (const stage of ServicesWithProgress.sendTransaction(
                            //     request.from as string,
                            //     request,
                            // )) {
                            //     switch (stage.type) {
                            //         case StageType.RECEIPT:
                            //             stage.receipt.events = decodeEvents(nonFunctionalProvider, eventABIs, stage.receipt)
                            //             break
                            //         case StageType.CONFIRMATION:
                            //             stage.receipt.events = decodeEvents(nonFunctionalProvider, eventABIs, stage.receipt)
                            //             break
                            //     }
                            // }
                        }
                        return
                    }
            }
        },
    })
}

/**
 * Create a contract which will forward its all transactions to the
 * EthereumService in the background page and decode the result of calls automaticallly
 * @param address
 * @param contractInterface
 */
export function useContract<T extends Contract>(address: string, contractInterface: ContractInterface) {
    const account = useAccount()
    return useMemo(() => createContract<T>(account, address, contractInterface), [account, address, contractInterface])
}

/**
 * Create many contracts with same contract interface
 * @param listOfAddress
 * @param contractInterface
 */
export function useContracts<T extends Contract>(listOfAddress: string[], contractInterface: ContractInterface) {
    const account = useAccount()
    const contracts = useMemo(
        () => listOfAddress.map((address) => createContract<T>(account, address, contractInterface)),
        [account, listOfAddress, contractInterface],
    )
    return contracts.filter(Boolean) as T[]
}
