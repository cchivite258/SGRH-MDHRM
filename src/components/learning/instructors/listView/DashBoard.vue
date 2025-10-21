<script lang="ts" setup>
import { ref, watch, computed } from "vue";
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { getCharts } from "@/components/learning/instructors/listView/utils";
import SuccessChip from "@/app/common/components/SuccessChip.vue";
import { useLayoutStore } from "@/store/app";

const charts = ref<any>(getCharts(getChartColorsArray));
const totalInstructorsChart = ref(charts.value.totalInstructorsChart);
const totalCoursesChart = ref(charts.value.totalCoursesChart);
const instructorActivityChart = ref(charts.value.instructorActivityChart);
const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

const btnList = ref(["ALL", "1M", "6M", "1Y"]);
const overviewType = ref(3);

watch(layoutTheme, () => {
  totalInstructorsChart.value = null;
  totalCoursesChart.value = null;
  instructorActivityChart.value = null;
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    totalInstructorsChart.value = chartsVal.totalInstructorsChart;
    totalCoursesChart.value = chartsVal.totalCoursesChart;
    instructorActivityChart.value = chartsVal.instructorActivityChart;
  }, 200);
});
</script>
<template>
  <v-row>
    <v-col cols="12" sm="6" lg="2">
      <v-card>
        <v-card-text class="text-center">
          <apexchart
            v-if="totalInstructorsChart"
            class="apex-charts radialbar-chart-effect-primary"
            height="175"
            dir="ltr"
            :series="totalInstructorsChart.series"
            :options="totalInstructorsChart.chartOptions"
          />
          <div class="text-subtitle-1 font-weight-bold">Total Instructors</div>
          <div class="d-flex align-center justify-center mt-2">
            <SuccessChip isSuccess percent="7.78" />
            <span class="text-muted ms-1">than last week</span>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" sm="6" lg="2">
      <v-card>
        <v-card-text class="text-center">
          <apexchart
            v-if="totalCoursesChart"
            class="apex-charts radialbar-chart-effect-secondary"
            height="175"
            dir="ltr"
            :series="totalCoursesChart.series"
            :options="totalCoursesChart.chartOptions"
          />
          <div class="text-subtitle-1 font-weight-bold">Total Courses</div>
          <div class="d-flex align-center justify-center mt-2">
            <SuccessChip percent="1.39" />
            <span class="text-muted ms-1">than last week</span>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" lg="8">
      <Card title="Instructor Activity">
        <template #title-action>
          <v-btn-toggle
            v-model="overviewType"
            color="primary"
            variant="tonal"
            height="27"
          >
            <v-btn
              size="x-small"
              class="me-1"
              height="27"
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
            v-if="instructorActivityChart"
            class="apex-charts"
            height="185"
            dir="ltr"
            :series="instructorActivityChart.series"
            :options="instructorActivityChart.chartOptions"
          />
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
