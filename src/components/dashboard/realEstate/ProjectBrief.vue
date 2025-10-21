<script lang="ts" setup>
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { getCharts } from "@/components/dashboard/realEstate/utils";
import { ref, watch, computed } from "vue";
import { useLayoutStore } from "@/store/app";
import SuccessChip from "@/app/common/components/SuccessChip.vue";

const charts = ref<any>(getCharts(getChartColorsArray));
const briefs = ref(charts.value.briefs);
const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

watch(layoutTheme, () => {
  briefs.value = [];
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    briefs.value = chartsVal.briefs;
  }, 200);
});
</script>
<template>
  <v-card>
    <v-card-text>
      <v-row>
        <v-col
          v-for="(brief, index) in briefs"
          :key="'brief-' + index"
          class="text-center"
          cols="12"
          sm="6"
          lg="3"
          :class="index !== briefs.length - 1 ? 'right-border' : ''"
        >
          <div class="text-muted mb-3">{{ brief.title }}</div>
          <apexchart
            v-if="brief.chart"
            class="apex-charts"
            height="45"
            dir="ltr"
            :series="brief.chart.series"
            :options="brief.chart.chartOptions"
          />
          <v-divider vertical />
          <div class="mt-3">
            <CountTo
              class="text-subtitle-1 font-weight-bold me-2"
              :endVal="brief.endVal"
              :prefix="brief.prefix"
              :suffix="brief.suffix"
              :decimals="brief.decimals"
            />
            <SuccessChip
              :isSuccess="brief.isSuccess"
              :percent="brief.percent"
            />
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
