<script lang="ts" setup>
import {
  invoiceOverviewHeader,
  productItems,
} from "@/components/invoice/overview/utils";
import Table from "@/app/common/components/Table.vue";
</script>
<template>
  <Table :headerItems="invoiceOverviewHeader">
    <template #body>
      <tr
        v-for="(item, index) in productItems"
        :key="'invoice-list-item-' + item.id"
        height="60"
      >
        <td class="font-weight-bold text-start">
          {{ item.id }}
        </td>
        <td>
          <div class="font-weight-bold">{{ item.name }}</div>
          <div>{{ item.category }}</div>
        </td>
        <td class="text-center">{{ item.rate }}</td>
        <td class="text-center">{{ item.quantity }}</td>
        <td class="text-end">{{ item.amount }}</td>
      </tr>
    </template>
  </Table>
  <v-divider />
  <v-row justify="end">
    <v-col cols="12" lg="4">
      <div class="d-flex my-3 justify-space-between">
        <span>Sub Total</span>
        <span>$2,272.95</span>
      </div>
      <div class="d-flex my-3 justify-space-between">
        <span>Estimated Tax <span class="text-muted"> (18%) </span> </span>
        <span>$409.13</span>
      </div>
      <div class="d-flex my-3 justify-space-between">
        <span>Discount <span class="text-muted"> (STEEX30) </span> </span>
        <span>-$681.88</span>
      </div>
      <div class="d-flex my-3 justify-space-between">
        <span>Shipping Charge</span>
        <span>$65.00</span>
      </div>
      <v-divider class="my-3" />
      <div class="d-flex my-3 justify-space-between font-weight-bold">
        <span>Total Amount</span>
        <span>$2,050.20</span>
      </div>
    </v-col>
  </v-row>
</template>
