import { useMemo } from 'react'
import { EthereumAddress } from 'wallet.ts'
import { BigNumber, ContractFunction, ethers } from 'ethers'
import type { Contract, ContractInterface } from '@ethersproject/contracts'
import { last, pickBy } from 'lodash-es'
import Services from '../../extension/service'
import { useAccount } from './useAccount'
import { nonFunctionalSigner } from '../web3'
import type { FunctionFragment } from 'ethers/lib/utils'

function resolveParameters(...args: any[]) {
    const lastArg = last(args)
    const overrides = lastArg.nonce || lastArg.gasLimit || lastArg.gasPrice || lastArg.value || lastArg.from || lastArg.blockTag ? lastArg : undefined
    return [overrides ? args.slice(0, args.length - 1) : args, overrides]
}

function hijackEstimateGas(from: string, contract: Contract, estimateGas: ContractFunction<BigNumber>) {
    return new Proxy({}, {
        get(target, name) {
            const methodFragment = contract.interface.fragments.find((x) => x.type === 'function' && x.name === name)
            if (!methodFragment) throw new Error(`Cannot found method ${String(name)}.`)
            return async (...args: any[]) => {
                try {
                    const [values, overrides] = resolveParameters(args)
                    return Services.Ethereum.estimateGas(
                        {
                            from,
                            to: contract.address,
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
        },
    })
}

function hijackFunctions(from: string, contract: Contract, functions: ContractFunction<boolean>) {
    return functions
}

function createContract<T extends Contract>(from: string, address: string, contractInterface: ContractInterface) {
    if (!address || !EthereumAddress.isValid(address)) return null

    // create a dummy contract instance
    const contract = (new ethers.Contract(address, contractInterface, nonFunctionalSigner) as unknown) as T

    // create a dummy object for mounting stuff
    const hijackedContract: {
        [key: string]: any
    } = {}

    // hijack meta-methods
    Object.entries(contract.interface.functions).forEach(([name, fragment]) => {
        hijackedContract[name] = (...args: any[]) => {
            if (fragment.constant) {

            }
        }
    })

    // hijack meta-class methods on the dummy contract and redirect them to the background service
    return {
        ...contract,
        ...hijackedContract,
        estimateGas: hijackEstimateGas(from, contract, Reflect.get(contract, 'estimateGas')),
        functions: hijackFunctions(from, contract, Reflect.get(contract, 'functions')),
    } as T

    // return new Proxy(contract, {
    //     get(target, name) {
    //         const methodFragment = contract.interface.fragments.find((x) => x.type === 'function' && x.name === name)
    //         const eventFragments = contract.interface.events

    //         switch (name) {
    //             case 'estimateGas':
    //                 return hijackEstimateGas(from, contract, Reflect.get(target, 'estimateGas'))
    //             case 'functions':
    //                 return hijackFunctions(from, contract, Reflect.get(target, 'functions'))
    //             default:
    //                 // no a valid method invocation
    //                 if (!methodFragment) return Reflect.get(target, name)

    //                 return async (...args: any[]) => {
    //                     const [values, overrides] = resolveParameters(args)
    //                     const request: TransactionRequest = pickBy({
    //                         from,
    //                         to: contract.options.address,
    //                         data: contract.interface.encodeFunctionData(methodFragment as FunctionFragment, values),
    //                         ...overrides,
    //                     })

    //                     // constant fragment
    //                     if (methodFragment._isFragment) {
    //                         const result = await Services.Ethereum.callTransaction(request)
    //                         if (process.env.NODE_ENV === 'development')
    //                             console.log({
    //                                 type: 'call',
    //                                 name,
    //                                 args,
    //                                 request,
    //                                 result,
    //                             })
    //                         // return decodeOutputString(nonFunctionalProvider, methodABI?.outputs ?? [], result)
    //                         return '0x'
    //                     } else {
    //                         if (process.env.NODE_ENV === 'development')
    //                             console.log({
    //                                 type: 'send',
    //                                 name,
    //                                 args,
    //                                 request,
    //                             })

    //                         // for await (const stage of ServicesWithProgress.sendTransaction(
    //                         //     request.from as string,
    //                         //     request,
    //                         // )) {
    //                         //     switch (stage.type) {
    //                         //         case StageType.RECEIPT:
    //                         //             stage.receipt.events = decodeEvents(nonFunctionalProvider, eventABIs, stage.receipt)
    //                         //             break
    //                         //         case StageType.CONFIRMATION:
    //                         //             stage.receipt.events = decodeEvents(nonFunctionalProvider, eventABIs, stage.receipt)
    //                         //             break
    //                         //     }
    //                         // }
    //                     }
    //                     return
    //                 }
    //         }
    //     },
    // })
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
