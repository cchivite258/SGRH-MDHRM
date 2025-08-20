<script lang="ts" setup>
import { ref } from "vue";
import { properties } from "@/components/realEstate/utils";
import Listing from "@/components/realEstate/grid/Listing.vue";
import AgentListing from "@/components/realEstate/agent/gridView/Listing.vue";
import { agentListingData } from "@/components/realEstate/agent/utils";
import Pagination from "@/app/common/components/Pagination.vue";
const type = ref("property");
const page = ref(1);
</script>
<template>
  <div class="my-4 d-flex justify-space-between align-center">
    <v-btn-toggle
      v-model="type"
      variant="elevated"
      color="secondary"
      density="comfortable"
    >
      <v-btn value="property" @click="type = 'property'"> Property </v-btn>
      <v-btn value="agents" @click="type = 'agents'"> Agents </v-btn>
    </v-btn-toggle>
    <ListMenu
      isIcon
      isRounded
      variant="elevated"
      :listItems="['Action', 'Another action', 'Something else here']"
    />
  </div>
  <Listing v-if="type === 'property'" :data="properties" />
  <AgentListing v-else :data="agentListingData" is-overview />
  <Pagination v-model="page" />
</template>
