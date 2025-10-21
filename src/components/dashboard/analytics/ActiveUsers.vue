<script lang="ts" setup>
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";
import { basicBarChart, cities } from "@/components/dashboard/analytics/utils";
import { ref, onMounted, onBeforeUnmount } from "vue";

const rootEle = ref<any>(null);
onMounted(() => {
  if (typeof window !== "undefined") {
    loadMap();
  }
});

const loadMap = () => {
  const element = document.getElementById("activeUsers");
  if (element) {
    let root: any = am5.Root.new("activeUsers");
    root.setThemes([am5themes_Animated.new(root)]);
    var chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "rotateX",
        projection: am5map.geoNaturalEarth1(),
        minZoomLevel: 1,
        maxZoomLevel: 16
      })
    );
    const series = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldLow,
        exclude: ["AQ"]
      })
    );

    series.mapPolygons.template.setAll({
      fill: "#d6dae6" as any,
      tooltipText: "{name}",
      interactive: true,
      templateField: "columnSettings",
      opacity: 1
    });
    series.mapPolygons.template.states.create("hover", {
      fill: am5.color("#d6dae6")
    });

    let pointSeries = chart.series.push(
      am5map.MapPointSeries.new(root, {
        geoJSON: cities as any
      })
    );

    pointSeries.bullets.push(function () {
      return am5.Bullet.new(root, {
        sprite: am5.Circle.new(root, {
          radius: 5,
          fill: am5.color(0x374151),
          tooltipText: "{name}",
          opacity: 1
        })
      });
    });

    rootEle.value = root;
  }
};

onBeforeUnmount(() => {
  // Clean up when the component is unmounted
  if (rootEle.value) {
    rootEle.value.dispose();
  }
});
</script>
<template>
  <Card title="Active Users Right Now" class="h-100">
    <template #title-action>
      <v-hover>
        <template v-slot:default="{ isHovering, props }">
          <v-btn
            v-bind="props"
            :variant="!isHovering ? 'tonal' : 'elevated'"
            color="primary"
            height="28"
            class="px-2"
          >
            <i class="ph-file-text me-1"> </i> Reports
          </v-btn>
        </template>
      </v-hover>
    </template>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="6">
          <div class="amchart-map" id="activeUsers" />
        </v-col>
        <v-col cols="12" md="6">
          <div>
            <h4 class="text-muted font-weight-bold mb-3 text-uppercase">
              Compared to last month
            </h4>
            <CountTo :endVal="53736" class="text-h6 font-weight-bold" />
            <span class="text-muted ps-2">Users</span>
          </div>
          <apexchart
            height="260"
            dir="ltr"
            :series="basicBarChart.series"
            :options="basicBarChart.chartOptions"
          ></apexchart>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
</template>
