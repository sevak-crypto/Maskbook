import type { SocialNetwork } from '../../social-network/types'
import { mindsBase } from './base'

export const mindsShared: SocialNetwork.Shared & SocialNetwork.Base = {
    ...mindsBase,
    utils: {
        getHomePage: () => 'https://www.minds.com/',
    },
}
