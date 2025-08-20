<script lang="ts" setup>
const earnings = [
  {
    color: "primary",
    title: "Product Development",
    value: "28%"
  },
  {
    color: "secondary",
    title: "Startup Business",
    value: "15%"
  },
  {
    color: "info",
    title: "Corporate Design",
    value: "20%"
  },
  {
    color: "dark",
    title: " Develop Project",
    value: "18%"
  },
  {
    color: "success",
    title: "Prototype",
    value: "13%"
  },
  {
    color: "warning",
    title: "Design",
    value: "8%"
  }
];
</script>
<template>
  <Card title="Earning" class="h-100">
    <template #title-action>
      <ListMenu isIcon :listItems="['Current Years', 'Last Years']" />
    </template>
    <v-card-text>
      <div
        class="pa-2 d-flex align-center bg-primary-subtle justify-center mb-4 rounded"
      >
        <h4 class="mb-0">
          <CountTo
            :endVal="314.57"
            :decimals="2"
            prefix="$"
            suffix="M"
            class="text-h6 font-weight-bold"
          />
        </h4>
        <span class="text-muted ms-2"
          ><span class="text-success"><i class="ph-arrow-up" /> +23.57%</span>
          Last Month</span
        >
      </div>
      <v-progress-linear
        color="primary"
        :height="9"
        rounded
        :model-value="40"
      />

      <div
        v-for="(earning, index) in earnings"
        :key="'earning-' + index"
        class="d-flex justify-space-between my-4"
      >
        <div>
          <i class="ph-book" :class="'text-' + earning.color" />
          {{ earning.title }}
        </div>
        <div>{{ earning.value }}</div>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-btn block> View All Earnings <i class="ph-arrow-right ms-2" /> </v-btn>
    </v-card-actions>
  </Card>
</template>
