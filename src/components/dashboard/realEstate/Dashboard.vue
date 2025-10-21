<script lang="ts" setup>
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { ref, watch, computed } from "vue";
import { getCharts } from "@/components/dashboard/realEstate/utils";
import { useLayoutStore } from "@/store/app";

const charts = ref<any>(getCharts(getChartColorsArray));
const data = ref(charts.value.data);

const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

watch(layoutTheme, () => {
  data.value = [];
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    data.value = chartsVal.data;
  }, 200);
});
</script>
<template>
  <v-row>
    <v-col
      cols="12"
      sm="6"
      lg="3"
      v-for="(item, index) in data"
      :key="'real-estate-dashboard-' + index"
    >
      <v-card>
        <v-card-text>
          <v-row no-gutters justify="space-between">
            <v-col cols>
              <div class="d-flex flex-column h-100">
                <div class="text-muted text-subtitle-2 font-weight-regular">
                  {{ item.title }}
                </div>
                <div class="mt-auto">
                  <CountTo
                    class="text-h5 font-weight-bold mx-1"
                    :endVal="item.count"
                    :suffix="item.suffix"
                    :decimals="item.decimals"
                  />
                  <span
                    class="font-weight-bold"
                    :class="item.isSuccess ? 'text-success' : 'text-danger'"
                  >
                    <i v-if="item.isSuccess" class="ph-arrow-up"></i>
                    <i v-else class="ph-arrow-down"></i>
                    {{ item.percent }}
                  </span>
                </div>
              </div>
            </v-col>
            <v-col class="d-flex justify-end">
              <div class="temp-class">
                <apexchart
                  v-if="item.chart"
                  class="apex-charts"
                  height="110"
                  width="110"
                  dir="ltr"
                  :series="item.chart.series"
                  :options="item.chart.chartOptions"
                />
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
