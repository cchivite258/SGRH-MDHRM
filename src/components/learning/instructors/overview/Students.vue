<script lang="ts" setup>
import { ref, watch } from "vue";
import Listing from "@/components/eCommerce/customers/Listing.vue";
import { customers } from "@/components/eCommerce/customers/utils";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import { useRouter } from "vue-router";

const router = useRouter();
const filteredData = ref(customers);
const finalData = ref(customers);
const query = ref("");

watch(query, (newQuery: string) => {
  filteredData.value = finalData.value.filter((item) => {
    const val = newQuery.toLowerCase();
    if (
      item.name.toLowerCase().includes(val) ||
      item.email.toLowerCase().includes(val)
    ) {
      return item;
    }
  });
});

const onEdit = () => {
  router.push("/pages/profile-settings");
};
const onView = () => {
  router.push("/pages/profile");
};
</script>
<template>
  <v-row justify="space-between">
    <v-col lg="3">
      <QuerySearch
        placeholder="Search for courses, price or something..."
        v-model="query"
      />
    </v-col>
    <v-col lg="auto">
      <v-btn color="secondary"
        ><i class="ph-plus-circle" /> Add Students
      </v-btn>
    </v-col>
  </v-row>
  <Listing :customers="filteredData" @onView="onEdit" @onEdit="onView" />
</template>
