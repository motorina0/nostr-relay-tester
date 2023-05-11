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
                <q-btn @click="startTest" :disabled="!relayUrl || relayState.invalidUrl" color="primary" size="lg"
                  class="q-ml-md float-right" icon="hub" label="Run Test"></q-btn>
              </div>
              <div class="col-md-1 col-sm-4">
                <q-btn color="primary" size="lg" class="q-ml-md" icon="settings"></q-btn>
              </div>
            </div>
            <div v-if="relayState.invalidUrl" class="row q-mt-md">
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
        invalidUrl: false,
        error: null
      },
      relayInfoDoc: null
    }
  },
  methods: {
    startTest: async function () {
      console.log("### startTest", this.relayUrl)
      const x = await fetch("https://nostr-pub.wellorder.net", {
        headers: {
          accept: 'application/nostr+json'
        }
      })
      console.log('### x', await x.json())
    },
    checkWsUrl: async function () {
      try {
        console.log('### checkWsUrl')
        if (!this.relayUrl) {
          this.relayState.invalidUrl = false
          return
        }
        const url = new URL(this.relayUrl)
        if (['ws:', 'wss:'].indexOf(url.protocol) === -1) {
          this.relayState.invalidUrl = true
          this.relayState.errorMessage = "Protocol must be 'ws://' or 'wss://'"
          return
        }

        this.relayState.invalidUrl = false
        this.relayState.errorMessage = null
        await this.fetchRelayInfoDoc()
      } catch (error) {
        this.relayState.invalidUrl = true
        this.relayState.errorMessage = 'Invalid Websocket URL'
      }

    },
    fetchRelayInfoDoc: async function () {
      this.relayInfoDoc = await fetchRelayInfoDoc(this.relayUrl, 'https:')
      if (!this.relayInfoDoc) {
        this.relayInfoDoc = await fetchRelayInfoDoc(this.relayUrl, 'http:')
      }
      console.log('### relayInfoDoc', this.relayInfoDoc)
    },
  }
}
</script>
