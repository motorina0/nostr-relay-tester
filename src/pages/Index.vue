<template>
  <q-page>
    <div class="row q-mt-md">
      <div class="col-2"></div>
      <div class="col-8">
        <q-card>
          <q-card-section>
            <div class="row">
              <div class="col-md-8 col-sm-4">
                <q-input label="Nostr Relay Websocket Endpoint" placeholder="wss://"></q-input>
              </div>
              <div class="col-md-2 col-sm-4">
                <q-btn unelevated color="primary" size="lg" class="q-ml-md" icon="settings" label="Settings"></q-btn>
              </div>
              <div class="col-md-2 col-sm-4">
                <q-btn unelevated color="primary" size="lg" class="q-ml-md float-right" icon="hub"
                  label="Run Test"></q-btn>
              </div>

            </div>

          </q-card-section>
        </q-card>
      </div>

      <div class="col-2"></div>
    </div>

    <div class="row q-mt-md">
      <div class="col-2"></div>
      <div class="col-8">
        <q-card>
          <q-card-section>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-2"></div>
    </div>

  </q-page>
</template>

<script>
export default {
  name: 'PageIndex'
}
</script>
