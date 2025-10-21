<script lang="ts" setup>
import {
  productItems,
  productsHeader,
  tableOverview,
} from "@/components/eCommerce/orderOverview/utils";
import Table from "@/app/common/components/Table.vue";
import Status from "@/app/common/components/Status.vue";
import { useRouter } from "vue-router";
const router = useRouter();

const onRowClick = () => {
  router.push({ path: "/ecommerce/product-details" });
};
</script>
<template>
  <Card title="Product Items">
    <template #title-action>
      <v-btn color="danger" elevation="0" class="px-2" density="comfortable">
        <i class="ph-x me-1"></i>
        Cancel Order
      </v-btn>
    </template>
    <v-card-text
      data-simplebar
      style="max-height: calc(100vh - 370px)"
      class="mt-4"
    >
      <Table :headerItems="productsHeader">
        <template #body>
          <tr
            v-for="(item, index) in productItems"
            :key="'eCommerce-order-item-' + index"
            height="70"
            style="cursor: pointer"
            @click="onRowClick"
          >
            <td>
              <div class="d-flex align-center">
                <v-avatar size="large" class="bg-light pa-2" rounded>
                  <v-img :src="item.src" />
                </v-avatar>
                <div class="mx-2">
                  <div class="font-weight-bold">{{ item.name }}</div>
                  <div class="text-muted">{{ item.category }}</div>
                </div>
              </div>
            </td>
            <td>{{ item.price }}</td>
            <td>{{ item.quantity }}</td>
            <td class="text-end font-weight-bold">{{ item.amount }}</td>
          </tr>
        </template>
      </Table>

      <v-row>
        <v-col
          cols="12"
          sm="6"
          lg="3"
          v-for="(item, index) in tableOverview"
          :key="'table-overview-' + index"
        >
          <v-card class="dashed-border" elevation="0">
            <v-card-text class="text-center">
              <div class="text-muted">
                {{ item.title }}
              </div>
              <div class="mt-2">
                <span class="font-weight-bold text-subtitle-1">{{
                  item.value
                }}</span>
                <Status v-if="item.status" :status="item.status" />
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
</template>
