<script lang="ts">
import {
  Avatar10,
  Avatar9,
  Avatar8,
  Avatar7,
  Avatar6,
  Avatar4,
} from "@/assets/images/users/utils";
export default {
  data() {
    return {
      openDeals: [
        {
          src: Avatar10,
          title: "SASS app workflow diagram",
          subtitle: "Closing Deal date 14 Jan, 2023",
          price: 49.99,
        },
        {
          src: Avatar9,
          title: "Steex - Admin Dashboard",
          subtitle: "Closing Deal date 22 April, 2023",
          price: 132.94,
        },
        {
          src: Avatar8,
          title: "Create New Components",
          subtitle: "Closing Deal date 29 April, 2023",
          price: 349.99,
        },
        {
          src: Avatar7,
          title: "New Email Design Templates",
          subtitle: "Closing Deal date 23 March, 2023",
          price: 258.73,
        },
        {
          src: Avatar6,
          title: "Urban Modern Design",
          subtitle: "Closing Deal date 17 March, 2023",
          price: 374.61,
        },
        {
          src: Avatar4,
          title: "Airbnb React Development",
          subtitle: "Closing Deal date 03 Feb, 2023",
          price: 976.07,
        },
      ],
    };
  },
};
</script>
<template>
  <Card title="Open Deals">
    <template #title-action>
      <ListMenu
        isSortBy
        :listItems="[
          'Today',
          'Yesterday',
          'Last 7 days',
          'Last 30 days',
          'This Month',
          'Last Month',
        ]"
      />
    </template>
    <v-card-text data-simplebar style="max-height: 380px">
      <v-container
        v-for="(product, index) in openDeals"
        :key="'popular-product-' + index"
      >
        <v-row class="dashed-border">
          <v-col cols="auto" class="pe-0">
            <v-avatar rounded size="large">
              <v-img :src="product.src" />
            </v-avatar>
          </v-col>
          <v-col class="d-flex justify-space-between">
            <div>
              <h5 class="text-subtitle-2 font-weight-bold mb-1">
                {{ product.title }}
              </h5>
              <div class="text-muted">
                {{ product.subtitle }}
              </div>
            </div>
            <div class="d-flex align-center">
              <span class="text-primary font-weight-bold text-subtitle-2"
                >${{ product.price }}</span
              >
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </Card>
</template>
