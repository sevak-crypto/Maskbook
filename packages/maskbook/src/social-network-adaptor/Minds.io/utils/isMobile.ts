import { Environment, isEnvironment } from '@dimensiondev/holoflows-kit'
import { MindsUrl } from './url'

export const isMobileMinds = isEnvironment(Environment.ContentScript)
    ? location.hostname === MindsUrl.hostLeadingUrlMobile.substr(8)
    : !!navigator.userAgent.match(/Mobile|mobile/)
export const mindsDomain = isMobileMinds ? 'https://minds.com/' : 'https://minds.com/'
