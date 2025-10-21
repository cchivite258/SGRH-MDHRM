<script lang="ts" setup>
import Introduction from "@/components/learning/courses/overview/Introduction.vue";
import Tabs from "@/components/learning/courses/overview/Tabs.vue";
import ProductCard from "@/components/learning/courses/overview/ProductCard.vue";
</script>
<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" lg="9">
        <Introduction />
        <Tabs />
      </v-col>
      <v-col cols="12" lg="3">
        <ProductCard />
      </v-col>
    </v-row>
  </v-container>
</template>
