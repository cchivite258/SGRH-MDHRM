<script lang="ts" setup>
import { ref, watch, computed } from "vue";

import { getChartColorsArray } from "@/app/common/chartColorArray";
import { getCharts } from "@/components/dashboard/crm/utils";
import { useLayoutStore } from "@/store/app";

const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

const chart = ref<any>(getCharts(getChartColorsArray));
const emailSentChart = ref(chart.value.emailSentChart);
watch(layoutTheme, () => {
  emailSentChart.value = null;
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    emailSentChart.value = chartsVal.emailSentChart;
  }, 200);
});
</script>
<template>
  <Card title="Email Sent" class="h-100">
    <template #title-action>
      <ListMenu isIcon :listItems="['Current Year', 'Last Year']" />
    </template>
    <v-card-text>
      <apexchart
        v-if="emailSentChart"
        class="apex-charts email-apex-chart"
        height="365"
        dir="ltr"
        :series="emailSentChart.series"
        :options="emailSentChart.chartOptions"
      />
    </v-card-text>
  </Card>
</template>
