<script type="ts" setup>
import MarkerMap from "@/components/maps/google/Marker.vue";
import Overlays from "@/components/maps/google/Overlays.vue";
import StreetView from "@/components/maps/google/StreetView.vue";
import MapType from "@/components/maps/google/MapType.vue";
</script>

<template>
  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Markers">
        <v-card-text>
          <div id="gmaps-markers" class="gmaps">
            <MarkerMap />
          </div>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Overlays">
        <v-card-text>
          <div id="gmaps-overlay" class="gmaps">
            <Overlays />
          </div>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Street View Panoramas">
        <v-card-text>
          <div id="panorama" class="gmaps-panaroma">
            <StreetView />
          </div>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Map Types">
        <v-card-text>
          <div id="gmaps-types" class="gmaps">
            <MapType />
          </div>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
