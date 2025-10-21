<script lang="ts" setup>
import { ref, watch, computed } from "vue";
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { getCharts } from "@/components/dashboard/learning/utils";
import { useLayoutStore } from "@/store/app";

const chart = ref<any>(getCharts(getChartColorsArray));
const learningOverviewChart = ref(chart.value.learningOverviewChart);
const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

const overviewType = ref(3);
const btnList = ref(["ALL", "1M", "6M", "1Y"]);
watch(layoutTheme, () => {
  learningOverviewChart.value = null;
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    learningOverviewChart.value = chartsVal.learningOverviewChart;
  }, 200);
});
</script>
<template>
  <Card title="Learning Overview" class="h-100">
    <template #title-action>
      <v-btn-toggle
        v-model="overviewType"
        color="primary"
        variant="tonal"
        height="27"
        class="align-center"
      >
        <v-btn
          size="x-small"
          class="me-1"
          height="25"
          rounded
          v-for="btn in btnList"
          :key="btn"
        >
          {{ btn }}
        </v-btn>
      </v-btn-toggle>
    </template>
    <v-card-text>
      <apexchart
        v-if="learningOverviewChart"
        class="apex-charts ms-n3"
        height="300"
        dir="ltr"
        :series="learningOverviewChart.series"
        :options="learningOverviewChart.chartOptions"
      />
    </v-card-text>
  </Card>
</template>
