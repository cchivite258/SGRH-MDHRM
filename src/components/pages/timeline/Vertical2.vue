<script lang="ts" setup>
import { verticalTimeline2 } from "@/components/pages/timeline/utils";
import { DIR } from "@/app/const";
import { useLayoutStore } from "@/store/app";
import { computed } from "vue";
const state = useLayoutStore();

const isRtl = computed(() => {
  return state.dir === DIR.RTL;
});
</script>
<template>
  <Card title="Vertical Timeline 2">
    <v-card-text>
      <v-timeline
        density="compact"
        align="start"
        truncate-line="both"
        :side="isRtl ? 'start' : 'end'"
      >
        <v-timeline-item
          v-for="(activity, index) in verticalTimeline2"
          :key="'recent-activity-' + index"
          size="small"
          :dot-color="activity.color"
          elevation="0"
        >
          <template v-slot:icon>
            <v-avatar
              v-if="activity.src"
              :image="activity.src"
              size="small"
            ></v-avatar>
            <i v-else :class="activity.icon"></i>
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
