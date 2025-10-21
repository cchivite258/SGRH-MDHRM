<script lang="ts" setup>
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { ref, watch, computed } from "vue";
import { useLayoutStore } from "@/store/app";
import { getCharts } from "@/components/eCommerce/orders/utils";
import { formateDate } from "@/app/common/dateFormate";

const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

const charts = ref<any>(getCharts(getChartColorsArray));
const ecommerceOrdersChart = ref(charts.value.ecommerceOrdersChart);

const today = new Date();
const nextDay = new Date(today);
nextDay.setDate(today.getDate() + 1);

const date = ref([today, nextDay]);

watch(layoutTheme, () => {
  ecommerceOrdersChart.value = null;
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    ecommerceOrdersChart.value = chartsVal.ecommerceOrdersChart;
  }, 200);
});

const format = (dates: Date[]) => {
  const formattedDates = dates.map((date) => {
    return formateDate(date);
  });

  return `${formattedDates[0]} to ${formattedDates[1]}`;
};
</script>
<template>
  <v-card class="h-100">
    <v-card-text>
      <div class="eCommerce-orders-calender simple-border">
        <VueDatePicker
          v-model="date"
          range
          :teleport="true"
          height="150"
          :enable-time-picker="false"
          :format="format"
          :clearable="false"
          position="left"
        />
        <i class="ph ph-caret-down"></i>
      </div>
      <apexchart
        v-if="ecommerceOrdersChart"
        class="apex-charts"
        height="350"
        dir="ltr"
        :series="ecommerceOrdersChart.series"
        :options="ecommerceOrdersChart.chartOptions"
      />
    </v-card-text>
  </v-card>
</template>
