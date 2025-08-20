<script lang="ts" setup>
import PortfolioOverview from "@/components/eCommerce/sellersOverview/PortfolioOverview.vue";
import Listing from "@/components/eCommerce/products/Listing.vue";
import { filter } from "@/components/eCommerce/sellersOverview/utils";
import { ref } from "vue";
import Filters from "@/components/eCommerce/sellersOverview/Filters.vue";
import ContactSupport from "@/components/eCommerce/sellersOverview/ContactSupport.vue";
import Reviews from "@/components/eCommerce/sellersOverview/Reviews.vue";
import Details from "@/components/eCommerce/sellersOverview/Details.vue";

const filters = ref(filter);
</script>
<template>
  <v-row>
    <v-col cols="12" lg="9">
      <PortfolioOverview />
      <Filters v-model="filters" />
      <Listing :filters="filters" />
    </v-col>
    <v-col cols="12" lg="3">
      <Details class="mb-5" />
      <Reviews class="mb-5" />
      <ContactSupport />
    </v-col>
  </v-row>
</template>
