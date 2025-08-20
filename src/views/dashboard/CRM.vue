<script lang="ts" setup>
import { crmBreadcrumb } from "@/components/dashboard/crm/utils";
import Overview from "@/components/dashboard/crm/Overview.vue";
import RealizedRate from "@/components/dashboard/crm/RealizedRate.vue";
import BalanceOverview from "@/components/dashboard/crm/BalanceOverview.vue";
import ContactLeads from "@/components/dashboard/crm/ContactLeads.vue";
import Email from "@/components/dashboard/crm/Email.vue";
import UsersActivity from "@/components/dashboard/crm/UsersActivity.vue";
import StatusBreakdown from "@/components/dashboard/crm/StatusBreakdown.vue";
import OpenDeals from "@/components/dashboard/crm/OpenDeals.vue";
import TaskList from "@/components/dashboard/crm/TaskList.vue";
</script>
<template>
  <Breadcrumb title="CRM" :items="crmBreadcrumb" />
  <Overview />
  <v-row>
    <v-col cols="12" lg="3">
      <RealizedRate />
    </v-col>
    <v-col cols="12" lg="9">
      <BalanceOverview />
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="12" lg="6">
      <ContactLeads />
    </v-col>
    <v-col cols="12" md="6" lg="3">
      <Email />
    </v-col>
    <v-col cols="12" md="6" lg="3">
      <UsersActivity />
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="12" lg="4">
      <StatusBreakdown />
    </v-col>
    <v-col cols="12" lg="4">
      <OpenDeals />
    </v-col>
    <v-col cols="12" lg="4">
      <TaskList />
    </v-col>
  </v-row>
</template>
