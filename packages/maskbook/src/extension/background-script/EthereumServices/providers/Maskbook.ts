import { Wallet } from '@ethersproject/wallet'
import { JsonRpcProvider } from '@ethersproject/providers'
import { currentMaskbookChainIdSettings } from '../../../../settings/settings'
import { getConstant } from '../../../../web3/helpers'
import { CONSTANTS } from '../../../../web3/constants'

export function createSigner(key: string, chainId = currentMaskbookChainIdSettings.value, url?: string) {
    const provider = createProvider(chainId, url)
    const signer = new Wallet(key)
    return signer.connect(provider)
}

// 5 is the length of weights
const SEED = Math.floor(Math.random() * 5)
const providerPool = new Map<string, JsonRpcProvider>()

export function createProvider(chainId = currentMaskbookChainIdSettings.value, url?: string) {
    // get the provider url by weights if needed
    if (!url) {
        const urls = getConstant(CONSTANTS, 'PROVIDER_ADDRESS_LIST', chainId)
        const weights = getConstant(CONSTANTS, 'PROVIDER_WEIGHT_LIST', chainId)
        url = urls[weights[SEED]]
    }
    const provider = providerPool.get(url) ?? new JsonRpcProvider(url)
    providerPool.set(url, provider)
    return provider
}
