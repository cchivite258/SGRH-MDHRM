<script lang="ts" setup>
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { getCharts } from "@/components/dashboard/learning/utils";
import {
  shopify,
  react,
  laravel,
  webpack
} from "@/assets/images/learning/utils";
import SuccessChip from "@/app/common/components/SuccessChip.vue";
import { ref, watch, computed } from "vue";
import { useLayoutStore } from "@/store/app";
const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

const charts = ref<any>(getCharts(getChartColorsArray));
const totalStudentsChart = ref(charts.value.totalStudentsChart);
const totalCoursesChart = ref(charts.value.totalCoursesChart);

watch(layoutTheme, () => {
  totalStudentsChart.value = null;
  totalCoursesChart.value = null;
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    totalStudentsChart.value = chartsVal.totalStudentsChart;
    totalCoursesChart.value = chartsVal.totalCoursesChart;
  }, 200);
});
const categories = [
  {
    title: "Shopify Development",
    src: shopify,
    color: "success"
  },
  {
    title: "Marketing & Management",
    src: webpack,
    color: "info"
  },
  {
    title: "Laravel Development",
    src: laravel,
    color: "danger"
  },
  {
    title: "React Development",
    src: react,
    color: "info"
  }
];
</script>
<template>
  <v-row>
    <v-col cols="12" md="6">
      <v-card class="h-100">
        <v-card-text>
          <div class="d-flex justify-space-between">
            <div class="text-muted text-subtitle-2 font-weight-regular">
              Total Students
            </div>
            <SuccessChip isSuccess percent=" 4.65%" />
          </div>

          <h3 class="mt-3">
            <CountTo
              class="text-h6 font-weight-bold"
              :endVal="4879"
              suffix="k"
            />
          </h3>
          <apexchart
            class="apex-charts"
            height="95"
            dir="ltr"
            :series="totalStudentsChart.series"
            :options="totalStudentsChart.chartOptions"
          >
          </apexchart>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="6">
      <v-card class="h-100">
        <v-card-text>
          <div class="d-flex justify-space-between">
            <div class="text-muted text-subtitle-2 font-weight-regular">
              Total Courses
            </div>
            <SuccessChip percent="1.27%" />
          </div>

          <h3 class="mt-3">
            <CountTo class="text-h6 font-weight-bold" :endVal="754" />
          </h3>
          <apexchart
            class="apex-charts"
            height="95"
            dir="ltr"
            :series="totalCoursesChart.series"
            :options="totalCoursesChart.chartOptions"
          />
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="12">
      <Card title="Features Course Categories">
        <template #title-action>
          <v-btn variant="text" color="primary" to="/learning/category">
            View All <i class="ph-arrow-right ms-1"></i>
          </v-btn>
        </template>
        <v-card-text>
          <v-row>
            <v-col
              cols
              sm="6"
              md
              v-for="(category, index) in categories"
              :key="'learning-widget-category-' + index"
              class="text-center"
            >
              <v-avatar
                :color="category.color"
                variant="tonal"
                rounded
                size="50"
              >
                <v-img :src="category.src" height="35" />
              </v-avatar>
              <div class="text-caption font-weight-bold mt-4">
                {{ category.title }}
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
