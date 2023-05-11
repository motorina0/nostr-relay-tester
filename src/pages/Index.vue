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
              <q-badge v-if="relay.status == 1" color="green">Connected</q-badge> 
              <q-badge v-else>...</q-badge> 
            </div>
            <div v-if="relayState.errorMessage" class="row q-mt-md">
              <div class="col-md-12">
                <q-badge color="pink"><span v-text="relayState.errorMessage"></span></q-badge>
              </div>
            </div>
            <div v-else-if="relayInfoDoc" class="q-mt-md">
              <span> Supported NIPS: </span>
              <q-badge v-for="nip in relayInfoDoc.supported_nips" :key="nip" class="q-mr-md"><span
                  v-text="nip"></span></q-badge>
            </div>


          </q-card-section>
        </q-card>
      </div>

      <div class="col-2"></div>
    </div>

    <div v-if="relayInfoDoc" class="row q-mt-md">
      <div class="col-2"></div>
      <div class="col-8">
        <q-card>
          <q-card-section>
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
      relay: null
    }
  },
  methods: {
    startTest: async function () {
      console.log("### startTest", this.relayUrl)
      await this.testNip01()
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
        await this.connectToRelay()
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
    connectToRelay: async function () {
      try {
        this.relay = NostrTools.relayInit(this.relayUrl)
        this.relay.on('connect', () => {
          this.relayState.connected = true
        })
        this.relay.on('error', () => {
          this.relayState.errorMessage = "Failed to connect"
          this.relayState.connected = false
        })
        console.log('### this.relay.', this.relay)
        await this.relay.connect()
      } catch (error) {
        this.relay = null
        console.warn(error)
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
    testNip01: async function () {

    }
  }
}
</script>
