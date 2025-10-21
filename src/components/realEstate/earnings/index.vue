<script lang="ts" setup>
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { ref, watch, computed } from "vue";
import Dashboard from "@/components/realEstate/earnings/Dashboard.vue";
import { getCharts } from "@/components/realEstate/earnings/utils";
import { formateDate } from "@/app/common/dateFormate";
import Listing from "@/components/realEstate/earnings/Listing.vue";
import { useLayoutStore } from "@/store/app";
const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

const chart = ref<any>(getCharts(getChartColorsArray));
const realEstateEarningsChart = ref(chart.value.realEstateEarningsChart);

watch(layoutTheme, () => {
  realEstateEarningsChart.value = null;
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    realEstateEarningsChart.value = chartsVal.realEstateEarningsChart;
  }, 200);
});
const today = new Date();
const lastDay = new Date(today);
lastDay.setDate(today.getDate() + 7);

const date = ref([today, lastDay]);

const format = (dates: Date[]) => {
  const formattedDates = dates.map((date) => {
    return formateDate(date);
  });

  return `${formattedDates[0]} to ${formattedDates[1]}`;
};
</script>
<template>
  <Dashboard />
  <v-card class="mt-4">
    <v-card-text>
      <apexchart
        v-if="realEstateEarningsChart"
        class="apex-charts"
        height="350"
        dir="ltr"
        :series="realEstateEarningsChart.series"
        :options="realEstateEarningsChart.chartOptions"
      />
    </v-card-text>
  </v-card>
  <Listing />
</template>
