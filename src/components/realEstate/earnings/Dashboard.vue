<script lang="ts" setup>
import { dashboardList } from "@/components/realEstate/earnings/utils";
import SuccessChip from "@/app/common/components/SuccessChip.vue";
</script>
<template>
  <v-row>
    <v-col
      cols="12"
      sm="6"
      md
      v-for="(item, index) in dashboardList"
      :key="'real-estate-overview-' + index"
    >
      <v-card>
        <v-card-text>
          <v-row justify="space-between">
            <v-col cols="auto">
              <h4>
                <CountTo
                  class="text-h6 font-weight-bold"
                  :endVal="item.countTo"
                  :prefix="item.prefix"
                  :suffix="item.suffix"
                />
              </h4>
              <p class="text-muted mt-4 text-uppercase">
                {{ item.title }}
              </p>
            </v-col>
            <v-col cols="auto">
              <SuccessChip
                :isSuccess="item.isSuccess"
                :percent="item.progress"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-progress-linear :model-value="100" :color="item.color" :height="2" />
      </v-card>
    </v-col>
  </v-row>
</template>
