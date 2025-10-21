<script lang="ts" setup>
import { ref, watch, computed } from "vue";
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { getOverview } from "@/components/dashboard/analytics/utils";
import { useLayoutStore } from "@/store/app";

const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

const OverviewList = ref(getOverview(getChartColorsArray));

watch(layoutTheme, () => {
  OverviewList.value = [];
  setTimeout(() => {
    OverviewList.value = getOverview(getChartColorsArray);
  }, 200);
});
</script>
<template>
  <v-row no-gutters>
    <v-col
      cols="12"
      sm="6"
      v-for="(overview, index) in OverviewList"
      :key="'overview-' + index"
      class="simple-border"
    >
      <v-card class="">
        <v-card-text>
          <div class="d-flex justify-space-between">
            <div class="dashboard-menu">
              <ListMenu
                isIcon
                :listItems="[
                  'Today',
                  'Last Week',
                  'Last Month',
                  'Current Year',
                ]"
              />
            </div>
            <apexchart
              height="100"
              width="50"
              dir="ltr"
              :series="overview.chart.series"
              :options="overview.chart.chartOptions"
            />
          </div>

          <div class="text-uppercase font-weight-medium text-muted pt-2">
            {{ overview.title }}
          </div>
          <div>
            <h3 class="py-3">
              <div v-if="overview.isTime">
                <CountTo
                  class="text-h6 font-weight-bold"
                  suffix="m"
                  :endVal="overview.min"
                />
                <CountTo
                  class="text-h6 font-weight-bold"
                  :endVal="overview.sec"
                  suffix="s"
                />
              </div>
              <CountTo
                v-else
                class="text-h6 font-weight-bold"
                :endVal="overview.countTo"
                :suffix="overview.suffix"
                :decimals="overview.decimals"
              />
            </h3>
          </div>
          <div class="d-flex">
            <span
              class="d-flex align-center pe-2 font-weight-bold"
              :class="overview.isSuccess ? 'text-success' : 'text-danger'"
              ><i
                v-if="overview.isSuccess"
                class="ph ph-arrow-up-right pe-1"
              ></i>
              <i v-else class="ph ph-trend-down pe-1"></i>
              {{ overview.progress }}
            </span>
            <span class="text-muted"> Analytics for last week </span>
          </div>
        </v-card-text>
      </v-card>
      <!-- <v-divider /> -->
    </v-col>
  </v-row>
</template>

