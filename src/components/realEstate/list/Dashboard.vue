<script lang="ts" setup>
import { dashboard } from "@/components/realEstate/list/utils";
import SuccessChip from "@/app/common/components/SuccessChip.vue";
</script>
<template>
  <v-row>
    <v-col
      v-for="(item, index) in dashboard"
      :key="'real-estate-dashboard-' + index"
      cols="12"
      sm="6"
      lg
    >
      <v-card>
        <v-card-text>
          <v-row justify="space-between">
            <v-col cols="auto">
              <CountTo class="text-h6 font-weight-bold" :endVal="item.endVal" />
              <p class="text-muted mt-5 text-uppercase font-weight-medium">
                {{ item.title }}
              </p>
            </v-col>
            <v-col cols="auto">
              <SuccessChip
                :isSuccess="item.isSuccess"
                :percent="item.percent"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-progress-linear
          :model-value="100"
          :color="item.color"
          :height="3"
          class="mt-1"
        />
      </v-card>
    </v-col>
  </v-row>
</template>
