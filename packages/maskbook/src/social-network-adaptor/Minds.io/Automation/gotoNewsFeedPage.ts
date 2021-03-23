export function gotoNewsFeedPageMinds() {
    if (location.pathname.includes('/newsfeed/subscriptions')) location.reload()
    else location.pathname = '/newsfeed/subscriptions'
}
//done
