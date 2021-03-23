import { timeout } from '../../../utils/utils'
import { bioCardSelector } from '../utils/selector'
import { bioCardParser } from '../utils/fetch'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { MindsEncoding } from '../encoding'

export async function getProfileMinds() {
    const { publicKeyEncoder, publicKeyDecoder } = MindsEncoding
    const cardNode = (await timeout(new MutationObserverWatcher(bioCardSelector<false>(true)), 10000))[0]
    const bio = cardNode ? bioCardParser(cardNode).bio : ''
    return {
        bioContent: publicKeyEncoder(publicKeyDecoder(bio)[0] || ''),
    }
}
