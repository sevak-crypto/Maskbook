import type { SocialNetwork, SocialNetworkWorker } from '../../social-network/types'

const id = 'minds.com'
export const mindsBase: SocialNetwork.Base = {
    networkIdentifier: id,
    shouldActivate(location) {
        return location.host.endsWith(id)
    },
}
export const mindsWorkerBase: SocialNetworkWorker.WorkerBase & SocialNetwork.Base = {
    ...mindsBase,
    gunNetworkHint: id,
}
