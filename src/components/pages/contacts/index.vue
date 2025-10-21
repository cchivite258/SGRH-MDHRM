<script lang="ts" setup>
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import { contacts } from "@/components/pages/utils";
import ContactCard from "@/components/pages/ContactCard.vue";
import { ref, watch } from "vue";
import Pagination from "@/app/common/components/Pagination.vue";

const page = ref(1);
const filteredData = ref(contacts);
const query = ref("");
watch(query, (newQuery: string) => {
  filteredData.value = contacts.filter((item) => {
    const val = newQuery.toLowerCase();
    if (
      item.name.toLowerCase().includes(val) ||
      item.designation.toLowerCase().includes(val) ||
      item.location.toLowerCase().includes(val) ||
      item.email.toLowerCase().includes(val)
    ) {
      return item;
    }
  });
});
</script>
<template>
  <v-row justify="space-between">
    <v-col cols="auto" class="text-subtitle-1 font-weight-bold">
      Contact List
      <v-chip
        label
        color="success"
        variant="flat"
        density="compact"
        class="px-2"
      >
        834
      </v-chip>
    </v-col>
    <v-col cols="cols" lg="auto" class="d-flex align-center">
      <div class="w-100" style="min-width: 300px">
        <QuerySearch
          v-model="query"
          placeholder="Search for category or something..."
        />
      </div>
      <v-btn color="primary" class="ms-2">
        <i class="ph-plus me-1" /> Add New
      </v-btn>
    </v-col>
  </v-row>

  <v-row>
    <v-col
      v-for="(item, i) in filteredData"
      :key="'contact-' + i"
      cols="12"
      sm="6"
      lg="3"
    >
      <ContactCard :data="item" />
    </v-col>
  </v-row>
  <Pagination v-if="filteredData.length" v-model="page" />
  <div v-if="!filteredData.length" class="text-center pt-14">
    <div class="mb-3">
      <v-avatar size="80" color="primary" variant="tonal">
        <i class="ph-magnifying-glass ph-lg"></i>
      </v-avatar>
    </div>
    <span class="text-subtitle-1 font-weight-bold"
      >No matching records found</span
    >
  </div>
</template>
