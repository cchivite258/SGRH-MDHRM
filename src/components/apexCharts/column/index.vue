<script lang="ts" setup>
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { ref, watch, computed } from "vue";
import { getCharts } from "@/components/apexCharts/column/utils";
import { useLayoutStore } from "@/store/app";

const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

const charts = ref<any>(getCharts(getChartColorsArray));
const basicColumnChart = ref(charts.value.basicColumnChart);
const columnDatalabelChart = ref(charts.value.columnDatalabelChart);
const stackedColumnsChart = ref(charts.value.stackedColumnsChart);
const columnStackedChart = ref(charts.value.columnStackedChart);
const groupedStackedChart = ref(charts.value.groupedStackedChart);
const dumbbellChart = ref(charts.value.dumbbellChart);
const columnMarkersChart = ref(charts.value.columnMarkersChart);
const columnRotatedLabel = ref(charts.value.columnRotatedLabel);
const columnNegativeChart = ref(charts.value.columnNegativeChart);
const rangeColumnChart = ref(charts.value.rangeColumnChart);
const chartYearOption = ref(charts.value.chartYearOption);
const quarterChartOption = ref(charts.value.quarterChartOption);
const distributedColumnchart = ref(charts.value.distributedColumnchart);
const dynamicQuarterLoadedChart = ref(charts.value.dynamicQuarterLoadedChart);

watch(layoutTheme, () => {
  basicColumnChart.value = null;
  columnDatalabelChart.value = null;
  stackedColumnsChart.value = null;
  columnStackedChart.value = null;
  groupedStackedChart.value = null;
  dumbbellChart.value = null;
  columnMarkersChart.value = null;
  columnRotatedLabel.value = null;
  columnNegativeChart.value = null;
  rangeColumnChart.value = null;
  chartYearOption.value = null;
  quarterChartOption.value = null;
  distributedColumnchart.value = null;
  dynamicQuarterLoadedChart.value = null;
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    basicColumnChart.value = chartsVal.basicColumnChart;
    columnDatalabelChart.value = chartsVal.columnDatalabelChart;
    stackedColumnsChart.value = chartsVal.stackedColumnsChart;
    columnStackedChart.value = chartsVal.columnStackedChart;
    groupedStackedChart.value = chartsVal.groupedStackedChart;
    dumbbellChart.value = chartsVal.dumbbellChart;
    columnMarkersChart.value = chartsVal.columnMarkersChart;
    columnRotatedLabel.value = chartsVal.columnRotatedLabel;
    columnNegativeChart.value = chartsVal.columnNegativeChart;
    rangeColumnChart.value = chartsVal.rangeColumnChart;
    chartYearOption.value = chartsVal.chartYearOption;
    quarterChartOption.value = chartsVal.quarterChartOption;
    distributedColumnchart.value = chartsVal.distributedColumnchart;
    dynamicQuarterLoadedChart.value = chartsVal.dynamicQuarterLoadedChart;
  }, 1000);
});
</script>
<template>
  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Basic Column Charts">
        <v-card-text>
          <apexchart v-if="basicColumnChart" class="apex-charts" height="350" dir="ltr" :series="basicColumnChart.series"
            :options="basicColumnChart.chartOptions" />
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Column with Data Labels">
        <v-card-text>
          <apexchart v-if="columnDatalabelChart" class="apex-charts" height="350" dir="ltr" :series="columnDatalabelChart.series"
            :options="columnDatalabelChart.chartOptions" />
        </v-card-text>
      </Card>
    </v-col>
  </v-row>

  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Stacked Column Charts">
        <v-card-text>
          <apexchart v-if="stackedColumnsChart" class="apex-charts" height="350" dir="ltr" :series="stackedColumnsChart.series"
            :options="stackedColumnsChart.chartOptions" />
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Stacked Column 100">
        <v-card-text>
          <apexchart v-if="columnStackedChart" class="apex-charts" height="350" dir="ltr" :series="columnStackedChart.series"
            :options="columnStackedChart.chartOptions" />
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Grouped Stacked Columns">
        <v-card-text>
          <apexchart v-if="groupedStackedChart" class="apex-charts" height="350" dir="ltr" :series="groupedStackedChart.series"
            :options="groupedStackedChart.chartOptions" />
        </v-card-text>
      </Card>
    </v-col>

    <v-col cols="12" lg="6">
      <Card title="Dumbbell Chart">
        <v-card-text>
          <apexchart v-if="dumbbellChart" class="apex-charts" height="350" dir="ltr" :series="dumbbellChart.series"
            :options="dumbbellChart.chartOptions" />
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Column with Markers">
        <v-card-text>
          <apexchart v-if="columnMarkersChart" class="apex-charts" height="350" dir="ltr" :series="columnMarkersChart.series"
            :options="columnMarkersChart.chartOptions" />
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Column with Rotated Labels">
        <v-card-text>
          <apexchart v-if="columnRotatedLabel" class="apex-charts" height="350" dir="ltr" :series="columnRotatedLabel.series"
            :options="columnRotatedLabel.chartOptions" />
        </v-card-text>
      </Card>
    </v-col>
  </v-row>

  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Column with Nagetive Values">
        <v-card-text>
          <apexchart v-if="columnNegativeChart" class="apex-charts" height="350" dir="ltr" :series="columnNegativeChart.series"
            :options="columnNegativeChart.chartOptions" />
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Range Column Chart">
        <v-card-text>
          <apexchart v-if="rangeColumnChart" class="apex-charts" height="350" dir="ltr" :series="rangeColumnChart.series"
            :options="rangeColumnChart.chartOptions" />
        </v-card-text>
      </Card>
    </v-col>
  </v-row>

  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Dynamic Loaded Chart">
        <v-card-text>
          <div id="dynamicloadedchart-wrap">
            <div id="chart-year">
              <apexchart v-if="chartYearOption" type="bar" height="330" ref="chart" :options="chartYearOption.chartOptions"
                :series="chartYearOption.series" />
            </div>
            <!-- <div id="chart-quarter">
              <apexchart
                type="bar"
                height="330"
                ref="chartQuarter"
                :options="quarterChartOption.chartOptions"
                :series="quarterChartOption.series"
              />
            </div> -->
          </div>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Distributed Columns Charts">
        <v-card-text>
          <apexchart v-if="distributedColumnchart" class="apex-charts" height="350" dir="ltr" :series="distributedColumnchart.series"
            :options="distributedColumnchart.chartOptions" />
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
