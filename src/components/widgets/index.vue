<script lang="ts" setup>
import Widgets from "@/components/dashboard/analytics/Widgets.vue";
import Dashboard from "@/components/tickets/list/Dashboard.vue";
import Overview from "@/components/dashboard/crm/Overview.vue";
import ProjectBrief from "@/components/dashboard/realEstate/ProjectBrief.vue";
import Dashboard2 from "@/components/eCommerce/orders/Dashboard.vue";

import BrowserUsage from "@/components/dashboard/analytics/BrowserUsage.vue";
import PopularProperty from "@/components/dashboard/realEstate/PopularProperty.vue";
import FeedBack from "@/components/dashboard/realEstate/FeedBack.vue";
import SalesReport from "@/components/dashboard/analytics/SalesReport.vue";
import StatusBreakdown from "@/components/dashboard/crm/StatusBreakdown.vue";
import Overview2 from "@/components/dashboard/eCommerce/Overview.vue";
import SalesByCountry from "@/components/dashboard/eCommerce/SalesByCountry.vue";
import RealizedRate from "@/components/dashboard/crm/RealizedRate.vue";
import Email from "@/components/dashboard/crm/Email.vue";
</script>
<template>
  <div class="text-subtitle-1 mb-3 font-weight-bold text-decoration-underline">
    Tile Boxes
  </div>
  <Widgets />
  <Dashboard />
  <Overview />
  <ProjectBrief class="mt-5" />
  <Dashboard2 class="mt-5" />

  <div class="text-subtitle-1 my-5 font-weight-bold text-decoration-underline">
    Other Widgets
  </div>
  <v-row>
    <v-col cols="12" lg="4">
      <BrowserUsage />
    </v-col>
    <v-col cols="12" lg="4">
      <PopularProperty />
    </v-col>
    <v-col cols="12" lg="4">
      <FeedBack class="h-100" />
    </v-col>
  </v-row>

  <div class="text-subtitle-1 my-5 font-weight-bold text-decoration-underline">
    Chart & Map Widgets
  </div>
  <v-row>
    <v-col cols="12" lg="4">
      <SalesReport />
    </v-col>
    <v-col cols="12" lg="4">
      <StatusBreakdown />
    </v-col>
    <v-col cols="12" lg="4">
      <Overview2 />
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="12" lg="6">
      <SalesByCountry />
    </v-col>
    <v-col cols="12" lg="3">
      <RealizedRate />
    </v-col>
    <v-col cols="12" lg="3">
      <Email />
    </v-col>
  </v-row>
</template>
