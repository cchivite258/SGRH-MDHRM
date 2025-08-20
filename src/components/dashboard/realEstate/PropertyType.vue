<script lang="ts" setup>
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { getCharts } from "@/components/dashboard/realEstate/utils";
import { ref, watch, computed } from "vue";
import { useLayoutStore } from "@/store/app";
const state = useLayoutStore();

const layoutTheme = computed(() => state.layoutTheme);

const chart = ref<any>(getCharts(getChartColorsArray));
const propertiesTypeChart = ref(chart.value.propertiesTypeChart);

watch(layoutTheme, () => {
  propertiesTypeChart.value = null;
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    propertiesTypeChart.value = chartsVal.propertiesTypeChart;
  }, 200);
});
</script>
<template>
  <Card title="Properties Type" class="h-100">
    <template #title-action>
      <MenuList
        isIcon
        :menuItems="['Today', 'Last Week', 'Last Month', 'Current Year']"
      />
    </template>
    <v-card-text>
      <apexchart
        v-if="propertiesTypeChart"
        class="apex-charts"
        height="370"
        dir="ltr"
        :series="propertiesTypeChart.series"
        :options="propertiesTypeChart.chartOptions"
      />
    </v-card-text>
  </Card>
</template>
