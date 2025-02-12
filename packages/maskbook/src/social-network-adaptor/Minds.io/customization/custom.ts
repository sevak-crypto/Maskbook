import { useMemo, createElement } from 'react'
import { ValueRef, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { unstable_createMuiStrictModeTheme, ThemeProvider, makeStyles, PaletteMode } from '@material-ui/core'
import { useMaskbookTheme } from '../../../utils/theme'
import type { SocialNetworkUI } from '../../../social-network'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { composeAnchorSelector, composeAnchorTextSelector } from '../utils/selector'
import { toRGB, getBackgroundColor, fromRGB, shade, isDark, getForegroundColor } from '../../../utils/theme-tools'
import { Appearance } from '../../../settings/types'
import produce, { setAutoFreeze } from 'immer'
import type { InjectedDialogClassKey } from '../../../components/shared/InjectedDialog'
import type { StyleRules } from '@material-ui/core'
import { isMobileMinds } from '../utils/isMobile'

const primaryColorRef = new ValueRef(toRGB([29, 161, 242]))
const primaryColorContrastColorRef = new ValueRef(toRGB([255, 255, 255]))
const backgroundColorRef = new ValueRef(toRGB([255, 255, 255]))

export const PaletteModeProviderMinds: SocialNetworkUI.Customization.PaletteModeProvider = {
    current: new ValueRef<PaletteMode>('light'),
    start: startWatchThemeColor,
}

export function startWatchThemeColor(signal: AbortSignal) {
    function updateThemeColor() {
        const color = getBackgroundColor(composeAnchorSelector().evaluate()!)
        const contrastColor = getForegroundColor(composeAnchorTextSelector().evaluate()!)
        const backgroundColor = getBackgroundColor(document.body)
        PaletteModeProviderMinds.current.value = isDark(fromRGB(backgroundColor)!) ? 'dark' : 'light'

        if (color) primaryColorRef.value = color
        if (contrastColor) primaryColorContrastColorRef.value = contrastColor
        if (backgroundColor) backgroundColorRef.value = backgroundColor
    }
    const watcher = new MutationObserverWatcher(composeAnchorSelector())
        .addListener('onAdd', updateThemeColor)
        .addListener('onChange', updateThemeColor)
        .startWatch({
            childList: true,
            subtree: true,
        })
    signal.addEventListener('abort', () => watcher.stopWatch())
}
export function useThemeMindsVariant() {
    const primaryColor = useValueRef(primaryColorRef)
    const primaryContrastColor = useValueRef(primaryColorContrastColorRef)
    const backgroundColor = useValueRef(backgroundColorRef)
    const MaskbookTheme = useMaskbookTheme({
        appearance: isDark(fromRGB(backgroundColor)!) ? Appearance.dark : Appearance.light,
    })
    return useMemo(() => {
        const primaryColorRGB = fromRGB(primaryColor)!
        const primaryContrastColorRGB = fromRGB(primaryContrastColor)
        setAutoFreeze(false)

        const MindsTheme = produce(MaskbookTheme, (theme) => {
            theme.palette.background.paper = backgroundColor
            theme.palette.primary = {
                light: toRGB(shade(primaryColorRGB, 10)),
                main: toRGB(primaryColorRGB),
                dark: toRGB(shade(primaryColorRGB, -10)),
                contrastText: toRGB(primaryContrastColorRGB),
            }
            theme.shape.borderRadius = isMobileMinds ? 0 : 15
            theme.breakpoints.values = { xs: 0, sm: 687, md: 1024, lg: 1280, xl: 1920 }
            theme.components = theme.components || {}
            theme.components.MuiButton = {
                defaultProps: {
                    size: 'medium',
                    disableElevation: true,
                },
                styleOverrides: {
                    root: {
                        borderRadius: 500,
                        textTransform: 'initial',
                        fontWeight: 'bold',
                        minHeight: 39,
                        paddingLeft: 15,
                        paddingRight: 15,
                        boxShadow: 'none',
                        [`@media (max-width: ${theme.breakpoints.width('sm')}px)`]: {
                            '&': {
                                height: '28px !important',
                                minHeight: 'auto !important',
                                padding: '0 14px !important',
                            },
                        },
                    },
                    sizeLarge: {
                        minHeight: 49,
                        paddingLeft: 30,
                        paddingRight: 30,
                    },
                    sizeSmall: {
                        minHeight: 30,
                        paddingLeft: 15,
                        paddingRight: 15,
                    },
                },
            }
            theme.components.MuiPaper = {
                defaultProps: {
                    elevation: 0,
                },
            }
            theme.components.MuiTab = {
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                    },
                },
            }
        })
        setAutoFreeze(true)
        return unstable_createMuiStrictModeTheme(MindsTheme)
    }, [MaskbookTheme, backgroundColor, primaryColor, primaryContrastColor])
}

export function MindsThemeProvider(props: Required<React.PropsWithChildren<{}>>) {
    if (!process.env.STORYBOOK) throw new Error('This API is only for Storybook!')
    return createElement(ThemeProvider, { theme: useThemeMindsVariant(), ...props })
}

export const useInjectedDialogClassesOverwriteMinds = makeStyles((theme) =>
    createStyles<InjectedDialogClassKey>({
        root: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            [`@media (max-width: ${theme.breakpoints.width('sm')}px)`]: {
                display: 'block !important',
            },
        },
        container: {
            alignItems: 'center',
        },
        paper: {
            width: '600px !important',
            boxShadow: 'none',
            [`@media (max-width: ${theme.breakpoints.width('sm')}px)`]: {
                '&': {
                    display: 'block !important',
                    borderRadius: '0 !important',
                },
            },
        },
        dialogTitle: {
            display: 'flex',
            alignItems: 'center',
            padding: '10px 15px',
            borderBottom: `1px solid ${theme.palette.mode === 'dark' ? '#2f3336' : '#ccd6dd'}`,
            '& > h2': {
                display: 'inline-block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            },
            [`@media (max-width: ${theme.breakpoints.width('sm')}px)`]: {
                '&': {
                    display: 'flex',
                    justifyContent: 'space-between',
                    maxWidth: 600,
                    margin: '0 auto',
                    padding: '7px 14px 6px 11px !important',
                },
            },
        },
        dialogContent: {
            [`@media (max-width: ${theme.breakpoints.width('sm')}px)`]: {
                display: 'flex',
                flexDirection: 'column',
                maxWidth: 600,
                margin: '0 auto',
                padding: '7px 14px 6px !important',
            },
        },
        dialogActions: {
            padding: '10px 15px',
            [`@media (max-width: ${theme.breakpoints.width('sm')}px)`]: {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                maxWidth: 600,
                margin: '0 auto',
                padding: '7px 14px 6px !important',
            },
        },
        dialogBackdropRoot: {
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(110, 118, 125, 0.4)' : 'rgba(0, 0, 0, 0.4)',
        },
    }),
)

function createStyles<ClassKey extends string>(styles: Partial<StyleRules<ClassKey, {}>>): StyleRules<ClassKey> {
    return styles as any
}
