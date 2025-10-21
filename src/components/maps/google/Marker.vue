<script type="ts" setup>
import { GoogleMap, Marker as Markers } from 'vue3-google-map';
import appConfigs from "@/app/appConfigurations";

const apiKey = appConfigs.googleMapAPIKey
const markerClick = () => alert('You clicked in this marker');
const center = { lat: -12.043333, lng: -77.028333 };
const markerOptions = { position: center, label: 'L', title: 'Lima' };

</script>

<template>
  <GoogleMap
  :api-key="apiKey"
    style="width: 100%; height: 300px"
    :center="{ lat: -12.043333, lng: -77.028333 }"
    :zoom="15"
  >
    <Markers :options="markerOptions" @click="markerClick" />
  </GoogleMap>
</template>
