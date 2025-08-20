<script lang="ts" setup>
import {
  storageDetailsChart,
  pinedItems,
} from "@/components/fileManager/utils";

const emit = defineEmits(["onClose"]);

const onClose = () => {
  emit("onClose");
};
</script>
<template>
  <v-card class="file-manager-right-wrapper h-100">
    <v-card-title>
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-btn
            icon="ph-x ph-sm"
            color="danger"
            density="compact"
            variant="tonal"
            rounded
            class="me-2"
            @click="onClose"
          />
          <h4 class="text-body-1 font-weight-bold">Storage Details</h4>
        </div>
        <div class="text-danger text-right">Used 57%</div>
      </div>
    </v-card-title>
    <v-card-text>
      <apexchart
        type="donut"
        class="e-charts shadow-none mt-2"
        height="350"
        width="270"
        dir="ltr"
        :series="storageDetailsChart.series"
        :options="storageDetailsChart.chartOptions"
      />

      <h4 class="text-body-1 font-weight-bold my-4">Pined Items</h4>
      <v-card
        class="bg-light mb-3"
        v-for="(pinedItem, index) in pinedItems"
        :key="'pinedItems-' + index"
        elevation="0"
      >
        <v-card-text class="py-3">
          <div class="d-flex justify-space-between">
            <span class="font-weight-bold align-center d-flex">
              <i class="ph-push-pin-simple me-2" /> {{ pinedItem.name }}</span
            >
            <span class="text-muted">{{ pinedItem.size }}</span>
          </div>
        </v-card-text>
      </v-card>

      <v-card class="bg-primary position-relative" elevation="0" :height="120">
        <v-img
          class="w-100 h-100"
          src="@/assets/images/effect-pattern/pattern.png"
          cover
        >
          <div class="pa-5">
            <div>Invite 2 friends and get 5 GB extra space.</div>
            <v-btn variant="text" class="px-0">
              <div class="text-decoration-underline">Invite Friends</div>
              <i class="ph-arrow-right" />
            </v-btn>
          </div>
        </v-img>
      </v-card>
    </v-card-text>
  </v-card>
</template>
