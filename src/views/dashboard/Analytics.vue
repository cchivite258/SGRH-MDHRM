<script lang="ts" setup>
import { analyticsBreadcrumb } from "@/components/dashboard/analytics/utils";
import Widgets from "@/components/dashboard/analytics/Widgets.vue";
import PerformanceOverview from "@/components/dashboard/analytics/PerformanceOverview.vue";
import BrowserUsage from "@/components/dashboard/analytics/BrowserUsage.vue";
import ActiveUsers from "@/components/dashboard/analytics/ActiveUsers.vue";
import TopPages from "@/components/dashboard/analytics/TopPages.vue";
import Overview from "@/components/dashboard/analytics/Overview.vue";
import SalesReport from "@/components/dashboard/analytics/SalesReport.vue";
import Earning from "@/components/dashboard/analytics/Earning.vue";
</script>
<template>
  <Breadcrumb title="Analytics" :items="analyticsBreadcrumb" />
  <Widgets />
  <v-row>
    <v-col lg="8">
      <PerformanceOverview />
    </v-col>
    <v-col lg="4">
      <BrowserUsage />
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="12" lg="9">
      <ActiveUsers />
    </v-col>
    <v-col cols="12" lg="3">
      <TopPages />
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="12" lg="4">
      <Overview />
    </v-col>
    <v-col cols="12" lg="4">
      <SalesReport />
    </v-col>
    <v-col cols="12" lg="4">
      <Earning />
    </v-col>
  </v-row>
</template>
