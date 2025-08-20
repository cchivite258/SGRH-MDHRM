<script lang="ts" setup>
import { ref } from "vue";
import { filter } from "@/components/eCommerce/products/utils";
import TopFilters from "@/components/eCommerce/products/TopFilters.vue";
import Listing from "@/components/eCommerce/products/Listing.vue";
import { FilterType } from "@/components/eCommerce/products/types";

const filters = ref<FilterType>(filter);
</script>
<template>
  <TopFilters class="mb-4" v-model="filters" />
  <Listing :filters="filters" />
</template>
