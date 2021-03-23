import type { ProfileIdentifier, PostIdentifier } from '../../../database/type'
import { getPostUrlAtMinds, getProfileUrlAtMinds } from '../utils/url'
import tasks from '../../../extension/content-script/tasks'
import { isMobileMinds } from '../utils/isMobile'
import type { SocialNetworkUI } from '../../../social-network'

/**
 *  get things at server side with legacy Minds
 *  seems not possible since we cannot access the
 *  legacy Minds with only a fetch.
 *  resolve this problem when you can.
 */

export function fetchPostContent(post: PostIdentifier<ProfileIdentifier>): Promise<string> {
    return tasks(getPostUrlAtMinds(post)).getPostContent()
}

export function fetchProfile(self: ProfileIdentifier): Promise<SocialNetworkUI.CollectingCapabilities.ProfileUI> {
    return tasks(getProfileUrlAtMinds(self, isMobileMinds as boolean), {}).getProfile()
}
