import { CMC_LATEST_BASE_URL } from '../../constants'
import stringify from 'json-stable-stringify'

let WATCHED_COINS: number[] = []

let cmc_client: WebSocket

const message = {
    method: 'subscribe',
    id: 'price',
    data: {
        cryptoIds: WATCHED_COINS,
    },
    index: 'detail',
}

export function subscribeCMCPrice(coinId: number) {
    if (WATCHED_COINS.some((id) => id === coinId)) return
    else if (coinId) {
        WATCHED_COINS.push(coinId)
    }

    if (!cmc_client || cmc_client.readyState === WebSocket.CLOSED) {
        //#region if the connection be closed, reopen new connection and send message
        cmc_client = new WebSocket(CMC_LATEST_BASE_URL)
        cmc_client.onopen = () => cmc_client.send(stringify(message))
        cmc_client.onclose = () => {
            WATCHED_COINS = []
        }
        cmc_client.onmessage = (event: MessageEvent) => {
            console.log(event)
        }
    } else if (cmc_client.readyState === WebSocket.OPEN) {
        cmc_client.send(stringify(message))
    }
}

export function unSubscribeCMCPrice() {
    if (cmc_client) {
        cmc_client.close()
    }
}
