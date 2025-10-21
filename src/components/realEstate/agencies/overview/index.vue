<script lang="ts" setup>
import BasicDetails from "@/components/realEstate/agencies/overview/BasicDetails.vue";
import Listing from "@/components/realEstate/agencies/overview/Listing.vue";
import RightBar from "@/components/realEstate/agencies/overview/RightBar.vue";
</script>
<template>
  <v-row>
    <v-col cols="12" lg="9">
      <BasicDetails />
      <Listing />
    </v-col>
    <v-col cols="12" lg="3">
      <RightBar />
    </v-col>
  </v-row>
</template>
