<script lang="ts" setup>
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { ref, onMounted, watch, computed } from "vue";
import { getCharts } from "@/components/dashboard/realEstate/utils";
import { useLayoutStore } from "@/store/app";

const charts = ref<any>(getCharts(getChartColorsArray));
const totalRevenueChart = ref(charts.value.totalRevenueChart);
const totalIncomeChart = ref(charts.value.totalIncomeChart);
const revenuePropertySaleChart = ref(charts.value.revenuePropertySaleChart);
const revenuePropertyRentChart = ref(charts.value.revenuePropertyRentChart);
const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

const date = ref();
const selectedOption = ref("totalRevenue");
const options = [
  {
    color: "warning",
    endVal: 2478,
    prefix: "$",
    suffix: "M",
    subTitle: "Total Revenue",
    value: "totalRevenue",
  },
  {
    color: "success",
    endVal: 14587.37,
    decimals: 2,
    prefix: "$",
    subTitle: "Total Income",
    value: "totalIncome",
  },
  {
    color: "danger",
    endVal: 2365,
    subTitle: "Property Sell",
    value: "propertySell",
  },
  {
    color: "primary",
    endVal: 3456,
    subTitle: "Property Rent",
    value: "propertyRent",
  },
];
onMounted(() => {
  const startDate = new Date();
  const endDate = new Date(new Date().setDate(startDate.getDate() + 7));
  date.value = [startDate, endDate];
});

const onSectionChange = (selectedVal: any) => {
  selectedOption.value = selectedVal;
};

watch(layoutTheme, () => {
  totalRevenueChart.value = null;
  totalIncomeChart.value = null;
  revenuePropertySaleChart.value = null;
  revenuePropertyRentChart.value = null;
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    totalRevenueChart.value = chartsVal.totalRevenueChart;
    totalIncomeChart.value = chartsVal.totalIncomeChart;
    revenuePropertySaleChart.value = chartsVal.revenuePropertySaleChart;
    revenuePropertyRentChart.value = chartsVal.revenuePropertyRentChart;
  }, 200);
});
</script>
<template>
  <Card title="Revenue Overview">
    <template #title-action>
      <VueDatePicker
        v-model="date"
        range
        :teleport="true"
        :enable-time-picker="false"
        class="real-estate-revenue-calender"
      />
    </template>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="3">
          <div
            v-for="(option, index) in options"
            :key="'real-estate-overview-label-' + index"
            class="d-flex align-center px-2 py-1 rounded-sm mb-4 real-estate-overview-label"
            :class="selectedOption === option.value ? 'bg-light' : ''"
            @click="onSectionChange(option.value)"
          >
            <v-avatar :color="option.color" variant="tonal" rounded>
              <i class="bx bx-dollar-circle bx-sm"></i>
            </v-avatar>
            <div class="mx-3">
              <CountTo
                class="text-subtitle-1 font-weight-bold"
                :endVal="option.endVal"
                :prefix="option.prefix"
                :suffix="option.suffix"
                :decimals="option.decimals"
              />
              <div>{{ option.subTitle }}</div>
            </div>
          </div>
        </v-col>
        <v-col cols="12" md="9">
          <apexchart
            v-if="selectedOption === 'totalRevenue' && totalRevenueChart"
            class="apex-charts"
            height="328"
            dir="ltr"
            :series="totalRevenueChart.series"
            :options="totalRevenueChart.chartOptions"
          />
          <apexchart
            v-if="selectedOption === 'totalIncome' && totalIncomeChart"
            class="apex-charts"
            height="328"
            dir="ltr"
            :series="totalIncomeChart.series"
            :options="totalIncomeChart.chartOptions"
          />
          <apexchart
            v-if="selectedOption === 'propertySell' && revenuePropertySaleChart"
            class="apex-charts"
            height="328"
            dir="ltr"
            :series="revenuePropertySaleChart.series"
            :options="revenuePropertySaleChart.chartOptions"
          />
          <apexchart
            v-if="selectedOption === 'propertyRent' && revenuePropertyRentChart"
            class="apex-charts"
            height="328"
            dir="ltr"
            :series="revenuePropertyRentChart.series"
            :options="revenuePropertyRentChart.chartOptions"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
</template>
