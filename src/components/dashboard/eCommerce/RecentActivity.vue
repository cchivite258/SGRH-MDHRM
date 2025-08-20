<script lang="ts" setup>
import { Avatar2 } from "@/assets/images/users/utils";
import { DIR } from "@/app/const";
import { useLayoutStore } from "@/store/app";
import { computed } from "vue";
const state = useLayoutStore();

const isRtl = computed(() => {
  return state.dir === DIR.RTL;
});
const recentActivities = [
  {
    title: "Purchased by James Price",
    subTitle: "Product noise evolve smartwatch",
    time: "05:57 AM Today",
    icon: "ph-shopping-cart",
    color: "success"
  },
  {
    title: "Natasha Carey have liked the products",
    subTitle: "Allow users to like products in your WooCommerce store.",
    time: "25 Dec, 2022",
    src: Avatar2
  },
  {
    title: "Today offers by Digitech Galaxy",
    subTitle:
      "Offer is valid on orders of $230 Or above for selected products only.",
    time: "12 Dec, 2022",
    icon: "ph-percent",
    color: "secondary"
  },
  {
    title: "Favoried Product",
    subTitle: "Esther James have favorited product.",
    time: "25 Nov, 2022",
    icon: "ph-bookmark-simple",
    color: "warning"
  },
  {
    title: `Flash sale starting <span class="text-primary">Tomorrow</span>.`,
    subTitle: `Flash sale by <span class='text-black'>Zoetic Fashion</span>`,
    time: "22 Oct, 2022",
    icon: "ph-percent"
  },
  {
    title: "Monthly sales report",
    subTitle: `<span class="text-danger">2 days left</span> notification to submit the monthly sales report. <span class="text-warning text-decoration-underline">Reports Builder</span>`,
    time: "15 Oct, 2022",
    icon: "ph-chart-line",
    color: "info"
  }
];
</script>
<template>
  <Card title="Recent Activity" class="h-100">
    <template #title-action>
      <v-hover>
        <template v-slot:default="{ isHovering, props }">
          <v-btn
            v-bind="props"
            :variant="!isHovering ? 'tonal' : 'elevated'"
            color="info"
            size="small"
          >
            View More
            <i class="ph-caret-right" />
          </v-btn>
        </template>
      </v-hover>
    </template>
    <v-card-text data-simplebar style="height: 270px">
      <v-timeline
        density="compact"
        align="start"
        truncate-line="both"
        :side="isRtl ? 'start' : 'end'"
      >
        <v-timeline-item
          v-for="(activity, index) in recentActivities"
          :key="'recent-activity-' + index"
          size="small"
          :dot-color="activity.color"
        >
          <template v-slot:icon>
            <v-avatar v-if="activity.src" :image="activity.src" size="small" />
            <i v-else :class="activity.icon" />
          </template>
          <v-row>
            <v-col>
              <h6 class="mb-1" v-html="activity.title"></h6>
              <p class="text-muted mb-2" v-html="activity.subTitle"></p>
              <small class="mb-0 text-muted"> {{ activity.time }} </small>
            </v-col>
          </v-row>
        </v-timeline-item>
      </v-timeline>
    </v-card-text>
  </Card>
</template>
