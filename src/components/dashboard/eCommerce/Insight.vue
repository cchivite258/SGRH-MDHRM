<script lang="ts" setup>
const insights = [
  "The recognition that one has a mental illness",
  "Review market characteristics and trends",
  "Digital analytics data including site analytics",
  "Check uikings theme and give customer support",
  "Success stories and case studies",
  "Preferences & purchase activity",
];
</script>
<template>
  <Card title="Insight">
    <template #title-action>
      <ListMenu :listItems="['This Month', 'Last Month']" />
    </template>
    <v-card-text data-simplebar style="height: 290px">
      <div
        v-for="(insight, index) in insights"
        :key="'insight-' + index"
        class="simple-border py-2 px-4 d-flex align-center mb-3"
      >
        <i class="ph-check-square-offset ph-lg text-primary mx-1" />
        <span class="font-weight-bold">{{ insight }}</span>
      </div>
    </v-card-text>
  </Card>
</template>
