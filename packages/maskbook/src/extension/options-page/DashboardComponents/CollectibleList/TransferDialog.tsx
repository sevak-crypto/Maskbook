import { useState, FC } from 'react'
import { Button, createStyles, makeStyles, TextField } from '@material-ui/core'
import { Image } from '../../../../components/shared/Image'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps } from '../../DashboardDialogs/Base'
import { MaskbookIconOutlined } from '../../../../resources/MaskbookIcon'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            padding: theme.spacing(1),
        },
        button: {
            marginTop: theme.spacing(3),
        },
        placeholder: {
            width: 48,
            height: 48,
            opacity: 0.1,
        },
    }),
)

export interface TransferDialogProps {
    url?: string
    onTransfer?: (address: string) => void
}

export const TransferDialog: FC<WrappedDialogProps<TransferDialogProps>> = ({ ComponentProps, open, onClose }) => {
    const { t } = useI18N()
    const classes = useStyles()
    return (
        <DashboardDialogCore fullScreen={false} open={open} onClose={onClose}>
            <DashboardDialogWrapper
                primary={t('wallet_transfer_title')}
                icon={
                    ComponentProps?.url ? (
                        <Image
                            component="img"
                            width={160}
                            height={220}
                            style={{ objectFit: 'contain' }}
                            src={ComponentProps.url}
                        />
                    ) : (
                        <MaskbookIconOutlined className={classes.placeholder} />
                    )
                }
                size="medium"
                content={<Transfer url={ComponentProps?.url} onTransfer={ComponentProps?.onTransfer} />}
            />
        </DashboardDialogCore>
    )
}
interface TransferProps {
    url?: string
    onTransfer?(address: string | undefined): void
}

const Transfer: FC<TransferProps> = (props) => {
    const { t } = useI18N()
    const classes = useStyles()
    const [address, setAddress] = useState<string>()

    const onTransfer = () => {
        props.onTransfer?.(address)
    }
    return (
        <div className={classes.root}>
            <TextField
                required
                label={t('wallet_transfer_to_address')}
                placeholder={t('wallet_transfer_to_address')}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
            />
            <Button
                className={classes.button}
                variant="contained"
                color="primary"
                disabled={!address}
                onClick={onTransfer}>
                {t('wallet_transfer_send')}
            </Button>
        </div>
    )
}
