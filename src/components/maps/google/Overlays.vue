<script type="ts" setup>
import { GoogleMap, CustomMarker } from 'vue3-google-map';
import appConfigs from "@/app/appConfigurations";

const center = { lat: -12.043333, lng: -77.028333 };
const apiKey = appConfigs.googleMapAPIKey
</script>

<template>
  <GoogleMap
    :api-key="apiKey"
    style="width: 100%; height: 300px"
    :center="center"
    :zoom="15"
  >
    <CustomMarker :options="{ position: center, anchorPoint: 'BOTTOM_CENTER' }">
      <div style="text-align: center">
        <div class="gmaps-overlay">
          Lima
          <div class="gmaps-overlay_arrow above"></div>
        </div>
      </div>
    </CustomMarker>
  </GoogleMap>
</template>
