<script lang="ts" setup>
import {
  propertyOverview,
  propertyFeatures,
} from "@/components/realEstate/overview/utils";
</script>
<template>
  <Card title="Property Overview" elevation="0">
    <v-card-text>
      <v-row>
        <v-col
          cols="12"
          sm="6"
          lg="3"
          v-for="(item, index) in propertyOverview"
          :key="'property-overview-' + index"
        >
          <div class="dashed-border pa-3 d-flex align-center">
            <v-avatar
              :color="item.color"
              variant="tonal"
              class="me-2"
              rounded
              size="small"
            >
              <i :class="item.icon" />
            </v-avatar>
            <span class="text-subtitle-2 font-weight-regular">{{
              item.title
            }}</span>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
  <Card title="Property Features" elevation="0">
    <v-card-text>
      <v-row no-gutters>
        <v-col
          cols="12"
          sm="4"
          lg="2"
          v-for="item in propertyFeatures"
          :key="'property-feature-' + item"
          class="py-1"
        >
          {{ item }}
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
</template>
