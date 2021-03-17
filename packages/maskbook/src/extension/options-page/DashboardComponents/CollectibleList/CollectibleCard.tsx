import { Card, createStyles, IconButton, Link, makeStyles, MenuItem } from '@material-ui/core'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import { useCallback } from 'react'
import { Image } from '../../../../components/shared/Image'
import { MaskbookIconOutlined } from '../../../../resources/MaskbookIcon'
import { useMenu } from '../../../../utils/hooks/useMenu'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { useModal } from '../../DashboardDialogs/Base'
import { HideDialog } from './HideDialog'
import { TransferDialog } from './TransferDialog'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 4,
            position: 'relative',
            backgroundColor: theme.palette.background.paper,
        },
        icon: {
            top: theme.spacing(1),
            right: theme.spacing(1),
            position: 'absolute',
            zIndex: 1,
            backgroundColor: `${theme.palette.background.paper} !important`,
        },
        placeholder: {
            width: 64,
            height: 64,
            opacity: 0.1,
        },
    }),
)

export interface CollectibleCardProps {
    name: string
    description?: string
    url: string
    link: string
}

export function CollectibleCard(props: CollectibleCardProps) {
    const { t } = useI18N()
    const classes = useStyles(props)

    const [hideDialog, , openHideDialog] = useModal(HideDialog, {
        name: props.name,
        description: props.description,
    })
    const [transferDialog, , openTransferDialog] = useModal(TransferDialog)

    const [menu, openMenu] = useMenu(
        <MenuItem
            onClick={() =>
                openTransferDialog({
                    url: props.url,
                    onTransfer: () => {
                        console.log('on transfer')
                    },
                })
            }>
            {t('transfer')}
        </MenuItem>,
        <MenuItem
            onClick={() =>
                openHideDialog({
                    onConfirm: () => {
                        console.log('hide confirm')
                    },
                })
            }>
            {t('hide')}
        </MenuItem>,
    )

    const onClickMore = useCallback(
        (ev: React.MouseEvent<HTMLButtonElement>) => {
            ev.stopPropagation()
            ev.preventDefault()
            openMenu(ev)
        },
        [openMenu],
    )

    return (
        <>
            <Link target="_blank" rel="noopener noreferrer" href={props.link}>
                <Card className={classes.root} style={{ width: 160, height: 220 }}>
                    <IconButton className={classes.icon} size="small" onClick={onClickMore}>
                        <MoreVertIcon />
                    </IconButton>
                    {props.url ? (
                        <Image
                            component="img"
                            width={160}
                            height={220}
                            style={{ objectFit: 'contain' }}
                            src={props.url}
                        />
                    ) : (
                        <MaskbookIconOutlined className={classes.placeholder} />
                    )}
                </Card>
            </Link>
            {menu}
            {hideDialog}
            {transferDialog}
        </>
    )
}
