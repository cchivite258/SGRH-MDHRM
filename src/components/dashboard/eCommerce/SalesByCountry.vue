<script lang="ts" setup>
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";
import { cities, countries } from "@/components/dashboard/eCommerce/utils";
import { ref, onMounted, onBeforeUnmount } from "vue";

const root = ref<any>(null);
onMounted(() => {
  if (typeof window !== "undefined") {
    loadMap();
  }
});

const loadMap = () => {
  const element = document.getElementById("salesByCountries");
  if (element) {
    let root: any = am5.Root.new("salesByCountries");
    root.setThemes([am5themes_Animated.new(root)]);
    var chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "rotateX",
        projection: am5map.geoNaturalEarth1(),
        minZoomLevel: 1,
        maxZoomLevel: 16,
      })
    );
    const series = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldLow,
        exclude: ["AQ"],
      })
    );

    series.mapPolygons.template.setAll({
      fill: "#d6dae6" as any,
      tooltipText: "{name}",
      interactive: true,
      templateField: "columnSettings",
      opacity: 1,
    });
    series.mapPolygons.template.states.create("hover", {
      fill: am5.color("#d6dae6"),
    });

    let pointSeries = chart.series.push(
      am5map.MapPointSeries.new(root, {
        geoJSON: cities as any,
      })
    );

    pointSeries.bullets.push(function () {
      return am5.Bullet.new(root, {
        sprite: am5.Circle.new(root, {
          radius: 5,
          fill: am5.color(0x374151),
          tooltipText: "{name}",
          opacity: 1,
        }),
      });
    });
  }
};

onBeforeUnmount(() => {
  // Clean up when the component is unmounted
  if (root.value) {
    root.value.dispose();
  }
});
</script>
<template>
  <Card title="Sales by Countries">
    <template #title-action>
      <v-btn variant="tonal" color="primary" size="small">
        Export Report
      </v-btn>
    </template>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="8">
          <div class="amchart-map" id="salesByCountries"></div>
        </v-col>
        <v-col cols="12" md="4">
          <div>
            <h4 class="text-muted font-weight-bold mb-3 text-uppercase">
              Compared to last month
            </h4>
            <CountTo :endVal="53736" class="text-h6 font-weight-bold" />
            <span class="text-muted ps-2">Sales</span>
          </div>
          <v-table density="compact" class="mt-4">
            <tbody>
              <tr
                v-for="(item, index) in countries"
                :key="item.name"
                :class="index % 2 !== 0 ? 'bg-primary-subtle' : ''"
              >
                <v-btn
                  icon
                  height="12"
                  width="12"
                  :color="item.color"
                  class="mt-3"
                >
                  <i class="ph ph-dot"></i>
                </v-btn>
                <td class="ps-1">{{ item.name }}</td>
                <td class="text-right">{{ item.sales }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
</template>

<style lang="scss">
.amchart-map {
  width: 100%;
  height: 350px;
}
</style>
