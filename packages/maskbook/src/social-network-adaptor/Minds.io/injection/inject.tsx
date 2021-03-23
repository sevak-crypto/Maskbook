import { injectPostDialogAtMinds } from './PostDialog'
import { injectPostDialogHintAtMinds } from './PostDialogHint'
import { injectPostDialogIconAtMinds } from './PostDialogIcon'

export function injectPostBoxComposed(signal: AbortSignal) {
    injectPostDialogAtMinds(signal)
    injectPostDialogHintAtMinds(signal)
    injectPostDialogIconAtMinds(signal)
}
