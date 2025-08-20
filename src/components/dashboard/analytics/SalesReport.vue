<script lang="ts" setup>
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { watch, computed, ref } from "vue";

import { getCharts } from "@/components/dashboard/analytics/utils";
import { useLayoutStore } from "@/store/app";

const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);
const charts = ref<any>(getCharts(getChartColorsArray));
const salesReportChart = ref(charts.value.salesReportChart);

watch(layoutTheme, () => {
  salesReportChart.value = null;
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    salesReportChart.value = chartsVal.salesReportChart;
  }, 200);
});
</script>
<template>
  <Card title="Sales Report" class="h-100">
    <template #title-action>
      <v-hover>
        <template v-slot:default="{ isHovering, props }">
          <v-btn
            v-bind="props"
            color="info"
            height="28"
            class="px-2"
            size="small"
            :variant="!isHovering ? 'tonal' : 'elevated'"
          >
            <i class="ph-file-text me-1"> </i> Generate Reports
          </v-btn>
        </template>
      </v-hover>
    </template>
    <v-card-text>
      <h4>
        <CountTo
          class="text-h6 font-weight-bold me-3"
          :endVal="452.32"
          :decimals="2"
          prefix="$"
          suffix="M"
        />
        <span class="text-success me-3"
          ><i class="ph-arrow-up"></i> +23.57%</span
        >
      </h4>
      <p class="text-muted mb-0">($215.32 Avg. revenue monthly)</p>
      <apexchart
        v-if="salesReportChart"
        class="apex-charts"
        height="300"
        dir="ltr"
        :series="salesReportChart.series"
        :options="salesReportChart.chartOptions"
      />
    </v-card-text>
  </Card>
</template>
