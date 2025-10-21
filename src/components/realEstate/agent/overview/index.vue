<script lang="ts" setup>
import PropertyOverview from "@/components/realEstate/agent/overview/PropertyOverview.vue";
import RightSidebar from "@/components/realEstate/agent/overview/RightSidebar.vue";
import Listing from "@/components/realEstate/agent/overview/Listing.vue";
</script>
<template>
  <v-row>
    <v-col cols="12" lg="9">
      <PropertyOverview />
      <Listing />
    </v-col>
    <v-col cols="12" lg="3">
      <RightSidebar />
    </v-col>
  </v-row>
</template>
