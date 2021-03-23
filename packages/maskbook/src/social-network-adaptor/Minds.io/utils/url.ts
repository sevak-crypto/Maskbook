import type { ProfileIdentifier, PostIdentifier } from '../../../database/type'
import { usernameValidator } from './user'
import { i18n } from '../../../utils/i18n-next'

export const MindsUrl = {
    hostIdentifier: 'minds.com',
    hostLeadingUrl: 'https://minds.com',
    hostLeadingUrlMobile: 'https://minds.com',
}

export const hostLeadingUrlAutoMinds = (isMobile: boolean) =>
    isMobile ? MindsUrl.hostLeadingUrlMobile : MindsUrl.hostLeadingUrl

export const getPostUrlAtMinds = (post: PostIdentifier<ProfileIdentifier>, isMobile: boolean = false) => {
    if (!usernameValidator(post.identifier.userId)) {
        throw new Error(i18n.t('service_username_invalid'))
    }
    return `${hostLeadingUrlAutoMinds(isMobile)}/${post.identifier.userId}/status/${post.postId}`
}

export const getProfileUrlAtMinds = (self: ProfileIdentifier, isMobile: boolean = false) => {
    return isMobile
        ? `${hostLeadingUrlAutoMinds(isMobile)}/account`
        : `${hostLeadingUrlAutoMinds(isMobile)}/${self.userId}`
}

// more about minds photo url formating: https://developer.minds.com/en/docs/tweets/data-dictionary/overview/entities-object#photo_format
export const canonifyImgUrl = (url: string) => {
    const parsed = new URL(url)
    if (parsed.hostname !== 'pbs.twimg.com') {
        return url
    }
    const { searchParams } = parsed
    searchParams.set('name', 'orig')
    // we can't understand original image format when given url labeled as webp
    if (searchParams.get('format') === 'webp') {
        searchParams.set('format', 'png')
        const pngURL = parsed.href
        searchParams.set('format', 'jpg')
        const jpgURL = parsed.href
        return [pngURL, jpgURL]
    }
    return parsed.href
}
