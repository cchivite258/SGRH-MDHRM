<script type="ts" setup>
import { GoogleMap } from 'vue3-google-map'
import appConfigs from "@/app/appConfigurations";

const apiKey = appConfigs.googleMapAPIKey
const center = { lat: -12.043333, lng: -77.028333 }
      const rectangle = {
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        bounds: {
          north: 33.685,
          south: 33.671,
          east: -116.234,
          west: -116.251,
        },
      }
</script>

<template>
  <GoogleMap
    :api-key="apiKey"
    style="width: 100%; height: 300px"
    mapTypeId="satellite"
    :center="center"
    :zoom="11"
  >
    <Rectangle :options="rectangle" />
  </GoogleMap>
</template>
