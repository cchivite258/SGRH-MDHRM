<script type="ts" setup>
import Vue3ChartJs from "@j-t-mcc/vue3-chartjs";
import { line, pie, Doughnut, radar, bar, PolarArea } from '@/components/charts/chartjs/utils'
</script>

<template>
  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Line Chart">
        <v-card-text class="chartjs-chart">
          <vue3-chart-js v-bind="{ ...line }"></vue3-chart-js>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Bar Chart">
        <v-card-text class="chartjs-chart">
          <vue3-chart-js v-bind="{ ...bar }"></vue3-chart-js>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Pie Chart">
        <v-card-text class="chartjs-chart">
          <vue3-chart-js :height="140" v-bind="{ ...pie }"></vue3-chart-js>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Donut Chart">
        <v-card-text class="chartjs-chart">
          <vue3-chart-js :height="140" v-bind="{ ...Doughnut }"></vue3-chart-js>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Polar area Chart">
        <v-card-text class="chartjs-chart">
          <vue3-chart-js
            :height="140"
            v-bind="{ ...PolarArea }"
          ></vue3-chart-js>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Radar Chart">
        <v-card-text class="chartjs-chart">
          <vue3-chart-js :height="140" v-bind="{ ...radar }"></vue3-chart-js>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>

<style lang="scss">
.chartjs-chart {
  height: 400px;
  display: flex;
  justify-content: center;
}
</style>
