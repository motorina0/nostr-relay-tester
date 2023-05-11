<template>
  <q-page>
    <div class="row q-mt-md">
      <div class="col-2"></div>
      <div class="col-8">
        <q-card>
          <q-card-section>
            <div class="row">
              <div class="col-md-9 col-sm-4">
                <q-input v-model="relayUrl" @input="checkWsUrl" label="Nostr Relay Websocket Endpoint"
                  placeholder="wss://"></q-input>
              </div>
              <div class="col-md-2 col-sm-4">
                <q-btn @click="startTest" :disabled="!relayUrl || relayState.errorMessage" color="primary" size="lg"
                  class="q-ml-md float-right" icon="hub" label="Run Test"></q-btn>
              </div>
              <div class="col-md-1 col-sm-4">
                <q-btn color="primary" size="lg" class="q-ml-md" icon="settings"></q-btn>
              </div>
            </div>
            <div v-if="relay">
              <q-badge v-if="relayState.connected" color="green">Connected</q-badge>
              <q-badge v-else>...</q-badge>
            </div>
            <div v-if="relayState.errorMessage" class="row q-mt-md">
              <div class="col-md-12">
                <q-badge color="pink"><span v-text="relayState.errorMessage"></span></q-badge>
              </div>
            </div>
            <div v-else-if="relayInfoDoc" class="q-mt-md">
              <span class="q-mr-md"> Supported NIPs: </span>
              <q-badge v-for="nip in relayInfoDoc.supported_nips" :key="nip" class="q-mr-md"><span
                  v-text="nip"></span></q-badge>
            </div>
          </q-card-section>
          <q-card-section v-if="relayInfoDoc">
            <q-expansion-item group="extras" icon="crop_free" label="Relay Information Document (NIP-11)">
              <q-card>
                <q-card-section>
                  <q-input :value="JSON.stringify(relayInfoDoc, null, 2)" type="textarea" rows="10" readonly></q-input>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-2"></div>
    </div>

    <div class="row q-mt-md">
      <div class="col-2"></div>
      <div class="col-8">
        <q-card>


        </q-card>
      </div>
      <div class="col-2"></div>
    </div>

  </q-page>
</template>

<script>
export default {
  name: 'PageIndex',
  data: function () {
    return {
      relayUrl: null,
      relayState: {
        errorMessage: null,
      },
      relayInfoDoc: null,
      relay: null,
      testData: {
        nip01: (alicePubkey, bobPubkey) => ({
          tests: [
            {

              description: "Set user metadata (kind:0)",
              actions: [
                {
                  type: 'publish',
                  actor: 'alice',
                  event: {
                    kind: 0,
                    pubkey: alicePubkey,
                    content: "{\"name\":\"alicet\",\"display_name\":\"the ugly\",\"about\":\"meeeee\",\"website\":\"lnbits.com\",\"lud16\":\"nostr@lnbits.com\"}",
                  }
                },
                {
                  type: 'subscribe',
                  actor: 'bob',
                  id: 'alice-meta',
                  filters: [{
                    kinds: [0],
                    authors: [alicePubkey]
                  }],
                  expect: {
                    events: [{
                      kind: 0,
                      pubkey: alicePubkey,
                      content: "{\"name\":\"alicet\",\"display_name\":\"the ugly\",\"about\":\"meeeee\",\"website\":\"lnbits.com\",\"lud16\":\"nostr@lnbits.com\"}",
                    }]
                  }
                }
              ]
            }
          ]

        })
      }
    }
  },
  methods: {
    startTest: async function () {
      console.log("### startTest", this.relayUrl)
      const alicePrivateKey = NostrTools.generatePrivateKey()
      const bobPrivateKey = NostrTools.generatePrivateKey()

      const context = {
        alice: {
          privateKey: alicePrivateKey,
          publicKey: NostrTools.getPublicKey(alicePrivateKey),
          relay: await this.connectToRelay(this.relayUrl)
        },
        bob: {
          privateKey: bobPrivateKey,
          publicKey: NostrTools.getPublicKey(bobPrivateKey),
          relay: await this.connectToRelay(this.relayUrl)
        }
      }

      console.log('### bind')
      context.alice.relay.listEvents = listEvents.bind(context.alice.relay)
      context.bob.relay.listEvents = listEvents.bind(context.bob.relay)

      await this.testNip01(context)
    },
    checkWsUrl: async function () {
      try {
        this.disconnectFromRelay()
        if (!this.relayUrl) {
          this.relayState.errorMessage = null
          return
        }
        const url = new URL(this.relayUrl)
        if (['ws:', 'wss:'].indexOf(url.protocol) === -1) {
          this.relayState.errorMessage = "Protocol must be 'ws://' or 'wss://'"
          return
        }

        this.relayState.errorMessage = null
        await this.fetchRelayInfoDoc()
        this.relay = await this.connectToRelay(this.relayUrl)
      } catch (error) {
        this.relayState.errorMessage = 'Invalid Websocket URL'
      }

    },
    fetchRelayInfoDoc: async function () {
      this.relayInfoDoc = await fetchRelayInfoDoc(this.relayUrl, 'https:')
      if (!this.relayInfoDoc) {
        this.relayInfoDoc = await fetchRelayInfoDoc(this.relayUrl, 'http:')
      }
    },
    connectToRelay: async function (relayUrl) {
      try {
        const relay = NostrTools.relayInit(relayUrl)
        relay.on('connect', () => {
          console.log('connected to relay')
          // this.relayState.connected = true
        })
        relay.on('error', () => {
          // this.relayState.errorMessage = "Failed to connect to relay"
          // this.relayState.connected = false
        })
        console.log('### relay.', relay)
        await relay.connect()
        return relay
      } catch (error) {
        console.warn(error)
        return null
      }
    },
    disconnectFromRelay: function () {
      try {
        if (!this.relay) return
        this.relay.close()
        this.relay = null
      } catch (error) {
        this.relay = null
        console.warn(error)
      }
    },
    testNip01: async function (op) {
      const data = this.testData.nip01(op.alice.publicKey, op.bob.publicKey)
      for (const t of data.tests) {
        console.log('#### test', t.description)
        for (const a of t.actions) {
          const actor = op[a.actor]
          switch (a.type) {
            case 'publish':
              const event = a.event // clone
              event.created_at = event.created_at || Math.floor(Date.now() / 1000)
              event.tags = event.tags || []
              event.id = NostrTools.getEventHash(event)
              event.sig = NostrTools.signEvent(event, actor.privateKey)
              actor.relay.publish(event)
              break
            case 'subscribe':
              const events = await actor.relay.listEvents(a.filters)
              console.log('### events', events)
              break

            default:
              break;
          }
        }
      }

    }
  }
}
</script>
