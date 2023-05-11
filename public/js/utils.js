
async function fetchRelayInfoDoc(relayUrl, protocol) {
    try {
        const url = new URL(relayUrl)
        url.protocol = protocol
        const resp = await fetch(url.toString(), {
            headers: {
                accept: 'application/nostr+json'
            }
        })
        return await resp.json()
    } catch (error) {
        return null
    }
}

async function listEvents(filters, opts = {}) {
    console.log('#### listEvents')
    return new Promise(resolve => {
        const s = this.sub(filters, opts)
        const events = []
        const timeoutCb = setTimeout(() => {
            resolve({ events, eose: false })
        }, opts.timeout || 3000)
        s.on('eose', () => {
            clearTimeout(timeoutCb)
            resolve({ events, eose: true })
        })
        s.on('event', (event) => {
            events.push(event)
        })
    })
}