<script lang="ts" setup>
import { realEstateBreadcrumb } from "@/components/dashboard/realEstate/utils";
import Dashboard from "@/components/dashboard/realEstate/Dashboard.vue";
import PropertyType from "@/components/dashboard/realEstate/PropertyType.vue";
import RevenueOverview from "@/components/dashboard/realEstate/RevenueOverview.vue";
import AddedProperty from "@/components/dashboard/realEstate/AddedProperty.vue";
import FeedBack from "@/components/dashboard/realEstate/FeedBack.vue";
import PopularProperty from "@/components/dashboard/realEstate/PopularProperty.vue";
import ProjectBrief from "@/components/dashboard/realEstate/ProjectBrief.vue";
import RecentActivity from "@/components/dashboard/eCommerce/RecentActivity.vue";
import AgentList from "@/components/dashboard/realEstate/AgentList.vue";
</script>
<template>
  <Breadcrumb title="Real Estate" :items="realEstateBreadcrumb" />
  <Dashboard />
  <v-row>
    <v-col cols="12" lg="4">
      <PropertyType />
    </v-col>
    <v-col cols="12" lg="8">
      <RevenueOverview />
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="12" lg="9">
      <AddedProperty />
    </v-col>
    <v-col cols="12" lg="3">
      <FeedBack />
    </v-col>
  </v-row>
  <v-row>
    <v-col lg="4" cols="12">
      <PopularProperty />
    </v-col>
    <v-col lg="8" cols="12">
      <ProjectBrief />
      <v-row class="mt-3">
        <v-col cols="12" md="6">
          <RecentActivity />
        </v-col>
        <v-col cols="12" md="6">
          <AgentList />
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
