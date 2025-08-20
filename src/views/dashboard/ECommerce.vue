<script lang="ts" setup>
import Overview from "@/components/dashboard/eCommerce/Overview.vue";
import Revenue from "@/components/dashboard/eCommerce/Revenue.vue";
import SalesByCountry from "@/components/dashboard/eCommerce/SalesByCountry.vue";
import TrafficSource from "@/components/dashboard/eCommerce/TrafficSource.vue";
import RecentSales from "@/components/dashboard/eCommerce/RecentSales.vue";
import LatestOrder from "@/components/dashboard/eCommerce/LatestOrder.vue";
import PopularProducts from "@/components/dashboard/eCommerce/PopularProducts.vue";
import OrderStatus from "@/components/dashboard/eCommerce/OrderStatus.vue";
import RecentActivity from "@/components/dashboard/eCommerce/RecentActivity.vue";
import Insight from "@/components/dashboard/eCommerce/Insight.vue";
</script>
<template>
  <v-row class="pt-4">
    <v-col cols="12" lg="4">
      <Overview />
    </v-col>
    <v-col cols="12" lg="8"> <Revenue /> </v-col>
  </v-row>
  <v-row>
    <v-col cols="12" lg="6">
      <SalesByCountry />
    </v-col>
    <v-col cols="12" lg="6">
      <v-row>
        <v-col cols="12" md="6"> <TrafficSource /> </v-col>
        <v-col cols="12" md="6"> <RecentSales /> </v-col>
      </v-row>
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="12" md="8">
      <LatestOrder />
    </v-col>
    <v-col cols="12" md="4">
      <PopularProducts />
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="12" lg="4">
      <OrderStatus />
    </v-col>
    <v-col cols="12" md="6" lg="4">
      <RecentActivity />
    </v-col>
    <v-col cols="12" md="6" lg="4">
      <Insight />
    </v-col>
  </v-row>
</template>
