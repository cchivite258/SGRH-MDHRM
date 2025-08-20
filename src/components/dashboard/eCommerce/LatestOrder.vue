<script lang="ts" setup>
import Status from "@/app/common/components/Status.vue";
import { orderList, headerItems } from "@/components/dashboard/eCommerce/utils";
import Table from "@/app/common/components/Table.vue";
</script>
<template>
  <Card title="Latest Orders">
    <template #title-action>
      <ListMenu
        isSortBy
        :listItems="['Order Date', 'Order ID', 'Amount', 'Status']"
      />
    </template>
    <v-card-text>
      <Table :headerItems="headerItems">
        <template #body>
          <tr v-for="item in orderList" :key="item.orderId" height="55">
            <td style="min-width: 120px">{{ item.orderDate }}</td>
            <td class="text-primary font-weight-bold">{{ item.orderId }}</td>
            <td><v-img :src="item.shopSrc" height="25" /></td>
            <td style="min-width: 120px">{{ item.customer }}</td>
            <td style="min-width: 140px">{{ item.products }}</td>
            <td>{{ item.amount }}</td>
            <td>
              <Status :status="item.status" />
            </td>
            <td style="min-width: 80px">
              <i v-if="item.rating" class="ph ph-star text-warning"></i>
              <span v-else> - </span>
              <span class="font-weight-bold px-1">{{ item.rating }}</span>
            </td>
          </tr>
        </template>
      </Table>
    </v-card-text>
  </Card>
</template>
