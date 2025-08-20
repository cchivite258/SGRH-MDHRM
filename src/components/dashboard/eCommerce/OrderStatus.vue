<script lang="ts">
export default {
  data() {
    return {
      orderStatus: [
        { title: "New", color: "primary", value: 307 },
        { title: "Pending", color: "warning", value: 177 },
        { title: "Reject", color: "secondary", value: 39 },
        { title: "Returns", color: "danger", value: 17 },
        { title: "Dispatched", color: "info", value: 661 },
        { title: "Delivered", color: "success", value: 1320 },
        { title: "Cancelled", color: "danger", value: 74 },
      ],
    };
  },
};
</script>
<template>
  <Card title="Order Status">
    <template #title-action>
      <ListMenu isIcon :listItems="['Current years', 'Last years']" />
    </template>
    <v-card-text>
      <div class="text-center">
        <h6 class="mb-3">01 Jan, 2023 - 01 Jan, 2024</h6>
        <v-row
          v-for="status in orderStatus"
          :key="'status-' + status.color"
          no-gutters
          class="mt-4"
        >
          <v-col cols="3" class="d-flex justify-space-between">
            <span> {{ status.title }} </span>
            <b> {{ status.value }} </b>
          </v-col>
          <v-col cols="9" class="d-flex align-center px-2">
            <v-progress-linear
              :model-value="status.value / 10"
              :color="status.color"
              height="10"
              striped
              rounded
            />
          </v-col>
        </v-row>
      </div>
    </v-card-text>
  </Card>
</template>
