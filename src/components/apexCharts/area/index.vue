<script lang="ts" setup>
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { ref, watch, computed } from "vue";
import { getCharts } from "@/components/apexCharts/area/utils";
import { useLayoutStore } from "@/store/app";

const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

const charts = ref<any>(getCharts(getChartColorsArray));
const basicAreaChart = ref(charts.value.basicAreaChart);
const splineAreaChart = ref(charts.value.splineAreaChart);
const datetimeAreaChart = ref(charts.value.datetimeAreaChart);
const areaNegativeChart = ref(charts.value.areaNegativeChart);
const areaMonthsChart = ref(charts.value.areaMonthsChart);
const areaYearsChart = ref(charts.value.areaYearsChart);
const areaStackedChart = ref(charts.value.areaStackedChart);
const areaIrregularChart = ref(charts.value.areaIrregularChart);
const areaNullValueChart = ref(charts.value.areaNullValueChart);

const selection = ref("one_year");
const chart = ref<any>(null);

watch(layoutTheme, () => {
  basicAreaChart.value = null;
  splineAreaChart.value = null;
  datetimeAreaChart.value = null;
  areaNegativeChart.value = null;
  areaMonthsChart.value = null;
  areaYearsChart.value = null;
  areaStackedChart.value = null;
  areaIrregularChart.value = null;
  areaNullValueChart.value = null;
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    basicAreaChart.value = chartsVal.basicAreaChart;
    splineAreaChart.value = chartsVal.splineAreaChart;
    datetimeAreaChart.value = chartsVal.datetimeAreaChart;
    areaNegativeChart.value = chartsVal.areaNegativeChart;
    areaMonthsChart.value = chartsVal.areaMonthsChart;
    areaYearsChart.value = chartsVal.areaYearsChart;
    areaStackedChart.value = chartsVal.areaStackedChart;
    areaIrregularChart.value = chartsVal.areaIrregularChart;
    areaNullValueChart.value = chartsVal.areaNullValueChart;
  }, 200);
});

const updateData = (timeline: any) => {
  selection.value = timeline;
  if (chart.value) {
    switch (timeline) {
      case "one_month":
        chart.value.zoomX(
          new Date("28 Jan 2013").getTime(),
          new Date("27 Feb 2013").getTime()
        );
        break;
      case "six_months":
        chart.value.zoomX(
          new Date("27 Sep 2012").getTime(),
          new Date("27 Feb 2013").getTime()
        );
        break;
      case "one_year":
        chart.value.zoomX(
          new Date("27 Feb 2012").getTime(),
          new Date("27 Feb 2013").getTime()
        );
        break;
      case "all":
        chart.value.zoomX(
          new Date("23 Jan 2012").getTime(),
          new Date("27 Feb 2013").getTime()
        );
        break;
      default:
    }
  }
};
</script>
<template>
  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Basic Area Chart">
        <v-card-text>
          <apexchart
            v-if="basicAreaChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="basicAreaChart.series"
            :options="basicAreaChart.chartOptions"
          />
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Spline Area Chart">
        <v-card-text>
          <apexchart
            v-if="splineAreaChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="splineAreaChart.series"
            :options="splineAreaChart.chartOptions"
          />
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Area Chart - Datetime X - Axis Chart">
        <v-card-text>
          <div class="d-flex justify-center">
            <v-btn
              density="comfortable"
              class="me-2"
              color="primary"
              id="one_month"
              @click="updateData('one_month')"
              :variant="selection === 'one_month' ? 'elevated' : 'tonal'"
            >
              1M
            </v-btn>
            <v-btn
              density="comfortable"
              class="me-2"
              color="primary"
              :variant="selection === 'six_months' ? 'elevated' : 'tonal'"
              @click="updateData('six_months')"
            >
              6M
            </v-btn>
            <v-btn
              density="comfortable"
              class="me-2"
              color="primary"
              :variant="selection === 'one_year' ? 'elevated' : 'tonal'"
              @click="updateData('one_year')"
            >
              1Y
            </v-btn>
            <v-btn
              density="comfortable"
              class="me-2"
              color="primary"
              :variant="selection === 'all' ? 'elevated' : 'tonal'"
              @click="updateData('all')"
            >
              ALL
            </v-btn>
          </div>
          <apexchart
            v-if="datetimeAreaChart"
            ref="chart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="datetimeAreaChart.series"
            :options="datetimeAreaChart.chartOptions"
          />
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Area with Negative Values Chart">
        <v-card-text>
          <apexchart
            v-if="areaNegativeChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="areaNegativeChart.series"
            :options="areaNegativeChart.chartOptions"
          />
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Area Chart - Github Style">
        <v-card-text>
          <div class="bg-light">
            <div id="area_chart-months" class="apex-charts" dir="ltr"></div>
            <apexchart
              v-if="areaMonthsChart"
              class="apex-charts"
              height="130"
              dir="ltr"
              :series="areaMonthsChart.series"
              :options="areaMonthsChart.chartOptions"
            />
          </div>

          <div class="github-style d-flex align-items-center my-2">
            <div class="flex-shrink-0 me-2">
              <img
                class="avatar-sm rounded"
                src="@/assets/images/users/avatar-2.jpg"
                data-hovercard-user-id="634573"
                alt=""
              />
            </div>
            <div class="flex-grow-1">
              <div>coder</div>
              <div class="cmeta text-muted font-size-11">
                <span class="commits"></span> commits
              </div>
            </div>
          </div>

          <div class="bg-light">
            <apexchart
              v-if="areaYearsChart"
              class="apex-charts"
              height="170"
              dir="ltr"
              :series="areaYearsChart.series"
              :options="areaYearsChart.chartOptions"
            />
          </div>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Stacked Area Chart">
        <v-card-text>
          <apexchart
            v-if="areaStackedChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="areaStackedChart.series"
            :options="areaStackedChart.chartOptions"
          />
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Irregular Timeseries Chart">
        <v-card-text>
          <apexchart
            v-if="areaIrregularChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="areaIrregularChart.series"
            :options="areaIrregularChart.chartOptions"
          />
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Area Chart With Null Values Chart">
        <v-card-text>
          <apexchart
            v-if="areaNullValueChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="areaNullValueChart.series"
            :options="areaNullValueChart.chartOptions"
          />
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
