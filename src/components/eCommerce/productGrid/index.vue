<script lang="ts" setup>
import { ref } from "vue";
import Filters from "@/components/eCommerce/productGrid/Filters.vue";
import { filter } from "@/components/eCommerce/productGrid/utils";
import Listing from "@/components/eCommerce/productGrid/Listing.vue";
import { FilterType } from "@/components/eCommerce/productGrid/types";

const filters = ref<FilterType>(filter);
</script>
<template>
  <v-row>
    <v-col lg="3">
      <Filters v-model="filters" />
    </v-col>
    <v-col lg="9">
      <Listing :filters="filters" />
    </v-col>
  </v-row>
</template>
