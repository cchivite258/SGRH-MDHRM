<script lang="ts" setup>
import SuccessChip from "@/app/common/components/SuccessChip.vue";
const overviews = [
  {
    amount: 368.24,
    prefix: "$",
    suffix: "M",
    decimals: 2,
    title: "Annual Profit",
    percent: "4.65%",
    isSuccess: true,
    color: "primary",
    icon: "ph-briefcase",
    progress: 73
  },
  {
    amount: 1454.71,
    prefix: "$",
    suffix: "k",
    decimals: 2,
    title: "Daily average income",
    percent: "1.33%",
    isSuccess: true,
    color: "secondary",
    icon: "ph-wallet",
    progress: 90
  },
  {
    amount: 33.37,
    suffix: "%",
    decimals: 2,
    title: "Lead Conversations",
    percent: "2.69%",
    isSuccess: false,
    color: "danger",
    icon: "ph-broadcast",
    progress: 20
  },
  {
    amount: 648,
    title: "Campaign Sent",
    percent: "0.78",
    isSuccess: false,
    color: "success",
    icon: "ph-rocket-launch",
    progress: 45
  },
  {
    amount: 1742,
    title: "Annual Deals",
    percent: "7.93%",
    isSuccess: true,
    color: "warning",
    icon: "ph-heartbeat",
    progress: 85
  }
];
</script>
<template>
  <v-row>
    <v-col
      cols="12"
      sm="6"
      md="6"
      lg
      v-for="(overview, index) in overviews"
      :key="'crm-overview-' + index"
    >
      <v-card>
        <v-card-text>
          <v-row>
            <v-col cols="9">
              <h4>
                <CountTo
                  class="text-h6 font-weight-bold"
                  :endVal="overview.amount"
                  :prefix="overview.prefix"
                  :suffix="overview.suffix"
                  :decimals="overview.decimals"
                />
              </h4>
              <p class="text-muted mb-5 mt-2">{{ overview.title }}</p>
              <SuccessChip
                :isSuccess="overview.isSuccess"
                :percent="overview.percent"
              />
              <span class="text-muted"> vs last month</span>
            </v-col>
            <v-col cols="3">
              <v-chip :color="overview.color" label size="x-large" class="pa-4">
                <i class="ph-xl" :class="overview.icon" />
              </v-chip>
            </v-col>
          </v-row>
        </v-card-text>
        <v-progress-linear
          :model-value="overview.progress"
          :color="overview.color"
          :height="5"
          class="mt-1"
        />
      </v-card>
    </v-col>
  </v-row>
</template>
