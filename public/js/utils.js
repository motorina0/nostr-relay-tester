
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

