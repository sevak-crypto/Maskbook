import { useCallback } from 'react'
import { MindsUrl } from '../utils/url'
import { MutationObserverWatcher, LiveSelector } from '@dimensiondev/holoflows-kit'
import { postEditorInTimelineSelector, postEditorInPopupSelector } from '../utils/selector'
import { renderInShadowRoot } from '../../../utils/shadow-root/renderInShadowRoot'
import { PostDialogHint } from '../../../components/InjectedComponents/PostDialogHint'
import { MaskMessage } from '../../../utils/messages'
import { hasEditor, isCompose } from '../utils/postBox'
import { startWatch } from '../../../utils/watcher'

export function injectPostDialogHintAtMinds(signal: AbortSignal) {
    const emptyNode = document.createElement('div')
    renderPostDialogHintTo('timeline', postEditorInTimelineSelector(), signal)
    renderPostDialogHintTo(
        'popup',
        postEditorInPopupSelector().map((x) => (isCompose() && hasEditor() ? x : emptyNode)),
        signal,
    )
}

function renderPostDialogHintTo<T>(reason: 'timeline' | 'popup', ls: LiveSelector<T, true>, signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(ls)
    startWatch(watcher, signal)

    renderInShadowRoot(<PostDialogHintAtMinds reason={reason} />, {
        shadow: () => watcher.firstDOMProxy.afterShadow,
        signal,
    })
}

function PostDialogHintAtMinds({ reason }: { reason: 'timeline' | 'popup' }) {
    const onHintButtonClicked = useCallback(
        () => MaskMessage.events.compositionUpdated.sendToLocal({ reason, open: true }),
        [reason],
    )
    return <PostDialogHint onHintButtonClicked={onHintButtonClicked} />
}
