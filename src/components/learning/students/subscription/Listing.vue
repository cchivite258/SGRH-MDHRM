<script lang="ts" setup>
import { subscriptionHeader } from "@/components/learning/students/subscription/utils";
import { PropType } from "vue";
import { SubscriptionType } from "@/components/learning/students/subscription/types";
import Table from "@/app/common/components/Table.vue";
import Status from "@/app/common/components/Status.vue";

const prop = defineProps({
  data: {
    type: Array as PropType<SubscriptionType[]>,
    default: () => [],
  },
});
</script>
<template>
  <Table :headerItems="subscriptionHeader">
    <template #body>
      <tr
        v-for="(item, index) in data"
        :key="'cart-item-' + index"
        height="70"
        style="cursor: pointer"
      >
        <td>
          <div class="d-flex align-center">
            <v-avatar
              size="50"
              class="pa-3"
              :class="item.backgroundColor"
              rounded="lg"
            >
              <v-img :src="item.logoImg" />
            </v-avatar>
            <div class="ms-3">
              <div class="text-subtitle-2 font-weight-bold">
                {{ item.course }}
              </div>
              <div class="text-muted">{{ item.category }}</div>
            </div>
          </div>
        </td>
        <td>{{ item.price }}</td>
        <td>{{ item.duration }}</td>
        <td><Status :status="item.status" /></td>

        <td :class="item.textColor">
          <div class="d-flex align-center">
            <i class="ph-clock me-1"></i> {{ item.paymentDue }}
          </div>
        </td>
        <td>
          <div v-if="item.status === 'active'" class="text-primary">
            <span
              v-if="item.action === 'Renew Now'"
              class="text-decoration-underline"
            >
              {{ item.action }}
            </span>
            <span v-if="item.action === 'Pay Now'" disabled class="text-muted">
              {{ item.action }}
            </span>
          </div>
          <div v-if="item.status === 'unActive'">
            <span class="text-decoration-underline text-primary">{{
              item.action
            }}</span>
          </div>
        </td>
      </tr>
    </template>
  </Table>

  <div v-if="!data.length" class="text-center pt-14">
    <div class="mb-3">
      <v-avatar size="80" color="primary" variant="tonal">
        <i class="ph-magnifying-glass ph-lg"></i>
      </v-avatar>
    </div>
    <span class="text-subtitle-1 font-weight-bold"
      >Sorry! No Result Found
    </span>
    <div class="text-muted">
      We've searched more than 164+ courses We did not find any courses for you
      search.
    </div>
  </div>
</template>
