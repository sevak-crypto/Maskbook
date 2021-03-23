import { SocialNetworkUI, stateCreator } from '../../social-network'
import { mindsShared } from './shared'
import { mindsBase } from './base'
import { IdentityProviderMinds } from './collecting/identity-provider'
import { PostProviderMinds } from './collecting/post'
import { createTaskStartSetupGuideDefault } from '../../social-network/defaults'
const origins = ['https://www.minds.com/*', 'https://m.minds.com/*', 'https://minds.com/*']
const define: SocialNetworkUI.Definition = {
    ...mindsShared,
    ...mindsBase,
    automation: {},
    collecting: {
        identityProvider: IdentityProviderMinds,
        postsProvider: PostProviderMinds,
    },
    configuration: {
        setupWizard: {
            disableSayHello: true,
        },
    },
    customization: {},
    init(signal) {
        const friends = stateCreator.friends()
        const profiles = stateCreator.profiles()
        return { friends, profiles }
    },
    injection: {
        setupWizard: createTaskStartSetupGuideDefault(mindsBase.networkIdentifier),
    },
    permission: {
        request: () => browser.permissions.request({ origins }),
        has: () => browser.permissions.contains({ origins }),
    },
}
export default define
