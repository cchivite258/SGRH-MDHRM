<script type="ts" setup>
import { GoogleMap } from 'vue3-google-map'
import appConfigs from "@/app/appConfigurations";

const apiKey = appConfigs.googleMapAPIKey

const center = { lat: 42.3455, lng: -71.0983 }
</script>

<template>
  <GoogleMap
    :api-key="apiKey"
    style="width: 100%; height: 300px"
    :center="center"
    :zoom="13"
  >
  </GoogleMap>
</template>
