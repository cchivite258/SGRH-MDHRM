<script lang="ts" setup>
import Listing from "@/components/learning/students/courses/Listing.vue";
import RightBar from "@/components/learning/students/courses/RightBar.vue";
</script>
<template>
  <v-row>
    <v-col cols="12" lg="9">
      <Listing />
    </v-col>
    <v-col cols="12" lg="3">
      <RightBar />
    </v-col>
  </v-row>
</template>
