<script lang="ts" setup>
import { getCharts } from "@/components/dashboard/eCommerce/utils";
import AmountDialog from "@/components/dashboard/eCommerce/AmountDialog.vue";
import { ref, watch, computed } from "vue";
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { useLayoutStore } from "@/store/app";

const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

const revenueType = ref(3);
const revenueBtnList = ref(["ALL", "1M", "6M", "1Y"]);
const dialog = ref(false);

const charts = ref<any>(getCharts(getChartColorsArray));
const revenueChart = ref(charts.value.revenueChart);
const budgetChart = ref(charts.value.budgetChart);
const payoutsChart = ref(charts.value.payoutsChart);

watch(layoutTheme, () => {
  revenueChart.value = null;
  budgetChart.value = null;
  payoutsChart.value = null;
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    revenueChart.value = chartsVal.revenueChart;
    budgetChart.value = chartsVal.budgetChart;
    payoutsChart.value = chartsVal.payoutsChart;
  }, 200);
});

const onDialogValueChange = (value: boolean) => {
  dialog.value = value;
};
</script>
<template>
  <v-card class="h-100">
    <v-card-text>
      <v-row>
        <v-col cols="12" lg="9" class="right-border position-relative">
          <div class="d-flex justify-space-between">
            <span class="text-subtitle-1 font-weight-bold"> Revenue</span>
            <v-btn-toggle
              v-model="revenueType"
              color="primary"
              variant="tonal"
              height="25"
            >
              <v-btn
                size="x-small"
                class="me-1"
                height="25"
                rounded
                v-for="btn in revenueBtnList"
                :key="btn"
              >
                {{ btn }}
              </v-btn>
            </v-btn-toggle>
          </div>
          <apexchart
            v-if="revenueChart"
            class="apex-charts"
            height="320"
            dir="ltr"
            :series="revenueChart.series"
            :options="revenueChart.chartOptions"
          />
        </v-col>
        <v-col cols="12" lg="3" class="pa-5">
          <div class="">
            <p class="text-muted mb-1">Budget (USD)</p>
            <div class="d-flex align-center">
              <h4 class="text-h6 font-weight-bold me-2">$750.36M</h4>
              <small class="text-success text-caption"
                ><i class="ph-arrow-up align-baseline"></i> 2.17%</small
              >
            </div>
            <p class="text-muted">Budget in than last years</p>
            <div class="mx-3 mt-3">
              <apexchart
                v-if="budgetChart"
                class="apex-charts"
                height="45"
                dir="ltr"
                :series="budgetChart.series"
                :options="budgetChart.chartOptions"
              />
            </div>
          </div>

          <div class="mt-4">
            <p class="text-muted mb-1">Payouts (USD)</p>
            <div class="d-flex align-center">
              <h4 class="text-h6 font-weight-bold me-2">$7,45,123</h4>
              <small class="text-danger text-caption"
                ><i class="ph-arrow-down align-baseline"></i> -1.36%</small
              >
            </div>
            <p class="text-muted">Payouts in than last years</p>
            <div class="mx-3 mt-3">
              <apexchart
                v-if="payoutsChart"
                class="apex-charts"
                height="55"
                dir="ltr"
                :series="payoutsChart.series"
                :options="payoutsChart.chartOptions"
              />
            </div>
          </div>
          <div class="mt-6">
            <v-btn color="primary" block @click="dialog = !dialog"
              >Add Amount</v-btn
            >
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
  <AmountDialog :dialog="dialog" @onDialogValueChange="onDialogValueChange" />
</template>
