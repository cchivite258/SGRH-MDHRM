<script lang="ts" setup>
import { ref, computed, watch } from "vue";
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { useLayoutStore } from "@/store/app";

const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

const overviewType = ref(3);
const btnList = ref(["ALL", "1M", "6M", "1Y"]);
const overviewList = ref([
  {
    title: "Total Revenue",
    price: "$795.69k",
    percent: "6.19%",
    isSuccess: true,
    color: "primary",
  },
  {
    title: "Total Expenses",
    price: "$415.37k",
    percent: "3.62%",
    isSuccess: true,
    color: "light",
  },
  {
    title: "Profit Ratio",
    price: "3.6%",
    percent: "1.47%",
    isSuccess: false,
    color: "dark",
  },
]);


</script>
<template>
  <Card title="Balance Overview" class="h-100">
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
    
  </Card>
</template>
